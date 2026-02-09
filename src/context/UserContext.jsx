import { createContext, useContext, useState, useEffect } from 'react';
import { taskApi } from '../api';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize
    useEffect(() => {
        const init = async () => {
            try {
                const allUsers = await taskApi.getUsers();
                setUsers(allUsers);

                // Check for existing session only - no auto-login
                /* 
                // AUTO-LOGIN DISABLED
                const savedId = localStorage.getItem('userId');
                if (savedId) {
                    const user = allUsers.find(u => u.id === savedId);
                    if (user) setCurrentUser(user);
                }
                */
                // No auto-login - user must select from login page
            } catch (err) {
                console.error('Failed to load users', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const login = async (userId) => {
        try {
            const user = await taskApi.login(userId);
            setCurrentUser(user);
            localStorage.setItem('userId', user.id);
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const addUser = async (userData) => {
        try {
            const newUser = {
                ...userData,
                id: `u${Date.now()}`, // simple ID generation
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`
            };
            const created = await taskApi.createUser(newUser);
            setUsers([...users, created]);
            return created;
        } catch (err) {
            throw new Error('Failed to create user');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('userId');
    };

    return (
        <UserContext.Provider value={{ currentUser, users, login, logout, addUser, loading }}>
            {children}
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
