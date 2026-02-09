import { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useUser } from '../../context/UserContext';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { taskApi } from '../../api';

export function BulkActions({ selectedIds, onComplete }) {
    const { refreshTasks } = useTasks();
    const { users } = useUser();
    const [action, setAction] = useState('status');
    const [payload, setPayload] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (!payload) return;
        setLoading(true);
        try {
            // Since context doesn't have bulk operation yet, using api directly or add to context
            // Using direct api for simplicity as per requirements
            const result = await taskApi.bulkOperation({
                taskIds: selectedIds,
                action: { type: action, payload }
            });

            if (result.failures.length > 0) {
                alert(`Completed with errors. Failures: ${result.failures.map(f => f.reason).join(', ')}`);
            }

            await refreshTasks();
            onComplete();
        } catch (err) {
            console.error(err);
            alert('Bulk operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-slate-200 p-4 rounded-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
            <span className="font-medium text-slate-700">{selectedIds.length} tasks selected</span>

            <Select
                value={action}
                onChange={e => { setAction(e.target.value); setPayload(''); }}
                className="w-32"
            >
                <option value="status">Set Status</option>
                <option value="reassign">Reassign</option>
            </Select>

            {action === 'status' ? (
                <Select value={payload} onChange={e => setPayload(e.target.value)} className="w-40">
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Completed">Completed</option>
                </Select>
            ) : (
                <Select value={payload} onChange={e => setPayload(e.target.value)} className="w-40">
                    <option value="">Select Member</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </Select>
            )}

            <Button onClick={handleApply} disabled={!payload || loading}>
                {loading ? 'Updating...' : 'Apply'}
            </Button>
            <Button variant="ghost" onClick={onComplete}>Cancel</Button>
        </div>
    );
}
