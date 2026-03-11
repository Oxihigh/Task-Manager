import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useUser } from '../../context/UserContext';
import { CATEGORIES, PRIORITIES } from '../../context/mockData';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Label } from '../ui/label';

export function TaskForm({ onClose }) {
    const { addTask } = useTasks();
    const { users } = useUser();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: CATEGORIES[0],
        priority: 'Medium',
        assigneeIds: [],
        dueDate: '',
        team: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.title) return;

        addTask({
            ...formData,
            status: 'Pending', // Default status
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Redesign Homepage"
                    required
                    autoFocus
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add details about the task..."
                    className="h-24"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                        id="category"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                        id="priority"
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="team">Team</Label>
                    {formData.team && (
                        <button
                            type="button"
                            onClick={() => {
                                const teamMembers = users.filter(u => u.team === formData.team);
                                const teamIds = teamMembers.map(u => u.id);
                                const current = formData.assigneeIds || [];
                                const merged = [...new Set([...current, ...teamIds])];
                                setFormData({ ...formData, assigneeIds: merged });
                            }}
                            className="text-xs text-indigo-600 hover:underline font-medium"
                        >
                            Select Entire Team
                        </button>
                    )}
                </div>
                <Select
                    id="team"
                    value={formData.team}
                    onChange={e => setFormData({ ...formData, team: e.target.value })}
                >
                    <option value="">No team</option>
                    <option value="Tech Team">Tech Team</option>
                    <option value="PR Team">PR Team</option>
                    <option value="Business Development Team">Business Development Team</option>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Assign To</Label>
                    <div className="border border-input rounded-md max-h-32 overflow-y-auto p-2 bg-white">
                        {users.map(u => (
                            <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 cursor-pointer text-sm">
                                <input
                                    type="checkbox"
                                    checked={(formData.assigneeIds || []).includes(u.id)}
                                    onChange={(e) => {
                                        const current = formData.assigneeIds || [];
                                        const newIds = e.target.checked
                                            ? [...current, u.id]
                                            : current.filter(id => id !== u.id);
                                        setFormData({ ...formData, assigneeIds: newIds });
                                    }}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{u.name}</span>
                                {u.team && (
                                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium ${u.team === 'Tech Team' ? 'bg-blue-50 text-blue-600' :
                                            u.team === 'PR Team' ? 'bg-pink-50 text-pink-600' :
                                                u.team === 'Business Development Team' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-slate-50 text-slate-500'
                                        }`}>{u.team.replace(' Team', '')}</span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Create Task</Button>
            </div>
        </form>
    );
}
