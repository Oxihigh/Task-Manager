import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function ProfileSettings() {
    const { currentUser, updateProfile } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;

        try {
            await updateProfile({ name, email });
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="text-xl font-bold">My Profile</CardTitle>
                <Button
                    variant={isEditing ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center space-y-4">
                        <img
                            src={currentUser?.avatar}
                            alt={currentUser?.name}
                            className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-sm"
                        />
                        <div className="text-center">
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                {currentUser?.role}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="flex-1 space-y-4 w-full">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                defaultValue={currentUser?.name}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-slate-50 border-transparent text-slate-700" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={currentUser?.email}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-slate-50 border-transparent text-slate-700" : ""}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    defaultValue={currentUser?.role}
                                    disabled={true}
                                    className="bg-slate-50 border-transparent text-slate-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Joined</Label>
                                <Input
                                    defaultValue={new Date(currentUser?.created_at || Date.now()).toLocaleDateString()}
                                    disabled={true}
                                    className="bg-slate-50 border-transparent text-slate-700"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium">
                                {error}
                            </div>
                        )}

                        {isEditing && (
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
