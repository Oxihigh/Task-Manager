import { useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { StatusBadge } from '../tasks/StatusBadge';

export function MemberDetail({ member }) {
    const { tasks } = useTasks();

    const memberTasks = useMemo(() =>
        tasks.filter(t => t.assigneeId === member.id),
        [tasks, member.id]);

    const stats = useMemo(() => {
        const total = memberTasks.length;
        const completed = memberTasks.filter(t => t.status === 'Completed').length;
        const pending = memberTasks.filter(t => t.status === 'Pending').length;
        const overdue = memberTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { total, completed, pending, overdue, rate };
    }, [memberTasks]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200"
                />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200">
                            {member.role}
                        </span>
                        <span className="text-sm text-slate-500">ID: {member.id}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Tasks</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                    <p className="text-2xl font-bold text-green-700">{stats.rate}%</p>
                    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Completion Rate</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                    <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
                    <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Pending</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                    <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                    <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">Overdue</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Assigned Tasks</h3>
                {memberTasks.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {memberTasks.map(task => (
                            <div key={task.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{task.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <StatusBadge status={task.status} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 italic text-sm">No tasks assigned properly.</p>
                )}
            </div>
        </div>
    );
}
