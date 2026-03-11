import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize session and auth state listener
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfileAndUsers(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    fetchProfileAndUsers(session.user.id);
                } else {
                    setCurrentUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfileAndUsers = async (userId) => {
        try {
            // Get current user's profile info
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profile) {
                const normalizedProfile = {
                    ...profile,
                    name: profile.name || profile.full_name || 'Unknown User',
                    role: profile.role || 'Member',
                    team: profile.team || null,
                    avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.full_name || 'U')}&background=random`
                };
                setCurrentUser(normalizedProfile);
            }

            // Get all profiles for assigning tasks, etc.
            const { data: allUsers, error: usersError } = await supabase
                .from('profiles')
                .select('*');

            if (allUsers) {
                const normalizedUsers = allUsers.map(u => ({
                    ...u,
                    name: u.name || u.full_name || 'Unknown User',
                    role: u.role || 'Member',
                    team: u.team || null,
                    avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || u.full_name || 'U')}&background=random`
                }));
                setUsers(normalizedUsers);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const register = async ({ name, email, password }) => {
        // 1. Sign up the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) throw error;

        // Note: The profile row in the 'profiles' table will be created
        // automatically via a Postgres Trigger that we will set up in SQL.
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const updateProfile = async (updates) => {
        if (!currentUser) throw new Error('No user logged in');

        // Map frontend expected format back to Supabase format
        const dbUpdates = {
            id: currentUser.id,
            full_name: updates.name,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', currentUser.id);

        if (error) throw error;

        // Optionally update auth email if changed (this requires email confirmation by default in Supabase)
        if (updates.email && updates.email !== currentUser.email) {
            const { error: authError } = await supabase.auth.updateUser({ email: updates.email });
            if (authError) throw authError;
        }

        // Refresh the profile to get the latest normalized data
        await fetchProfileAndUsers(currentUser.id);
    };

    const addUser = async (userData) => {
        if (currentUser?.role !== 'Admin') throw new Error('Only admins can create users');

        // Create a separate Supabase client so signing up a new user
        // does NOT log out the currently signed-in admin
        const { createClient } = await import('@supabase/supabase-js');
        const adminSupabase = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY
        );

        // 1. Create the auth user
        const { data: signUpData, error: signUpError } = await adminSupabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.name,
                }
            }
        });

        if (signUpError) throw signUpError;

        // 2. Update the profile row with the correct role (the trigger creates it with defaults)
        // Small delay to allow the trigger to fire
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newUserId = signUpData.user?.id;
        if (newUserId) {
            await supabase
                .from('profiles')
                .update({
                    full_name: userData.name,
                    role: userData.role || 'Member',
                    team: userData.team || null,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
                })
                .eq('id', newUserId);
        }

        // 3. Sign the temporary client out so it doesn't interfere
        await adminSupabase.auth.signOut();

        // 4. Refresh users list
        await fetchProfileAndUsers(currentUser.id);
        return signUpData;
    };

    const updateUserTeam = async (userId, team) => {
        const teamValue = team === '' ? null : team;

        const { data, error, count } = await supabase
            .from('profiles')
            .update({ team: teamValue })
            .eq('id', userId)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.error('Update returned no rows — RLS policy may be blocking the update. Try adding an UPDATE policy for the profiles table.');
        }

        await fetchProfileAndUsers(currentUser.id);
    };

    return (
        <UserContext.Provider value={{ currentUser, users, login, logout, updateProfile, addUser, updateUserTeam, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
