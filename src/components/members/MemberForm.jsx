import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { useUser } from '../../context/UserContext';
import { Copy, Check, UserPlus } from 'lucide-react';

export function MemberForm({ onClose }) {
    const { addUser } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Member'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [copiedField, setCopiedField] = useState('');

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password });
    };

    const copyToClipboard = async (text, field) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) return;
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await addUser(formData);
            setCreatedCredentials({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create member');
        } finally {
            setIsSubmitting(false);
        }
    };

    // After successful creation, show credentials
    if (createdCredentials) {
        return (
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <UserPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-green-800">Member Created Successfully!</h3>
                    <p className="text-sm text-green-600 mt-1">Share these credentials with the new member.</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Name</p>
                            <p className="font-medium">{createdCredentials.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Role</p>
                            <p className="font-medium">{createdCredentials.role}</p>
                        </div>
                    </div>
                    <hr />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                            <p className="font-mono text-sm">{createdCredentials.email}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                        >
                            {copiedField === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">Password</p>
                            <p className="font-mono text-sm">{createdCredentials.password}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                        >
                            {copiedField === 'password' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={onClose}>Done</Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Smith"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah@company.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        Generate Strong Password
                    </button>
                </div>
                <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="Member">Member</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Intern">Intern</option>
                </Select>
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Member'}
                </Button>
            </div>
        </form>
    );
}
