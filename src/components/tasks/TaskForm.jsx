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
        dueDate: ''
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
