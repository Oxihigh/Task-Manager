import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from '../components/ui/button'; // Assuming you have this
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Select } from '../components/ui/select';

export default function Login() {
    const { users, login } = useUser();
    const [selectedId, setSelectedId] = useState('');

    const handleLogin = () => {
        if (selectedId) login(selectedId);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Team Task Manager</CardTitle>
                    <p className="text-center text-slate-500">Select a user to simulate login</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        <option value="">Select User</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </Select>
                    <Button className="w-full" onClick={handleLogin} disabled={!selectedId}>
                        Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
