import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { useUser } from '../../context/UserContext';
import { StatusBadge } from '../tasks/StatusBadge';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { MessageSquare, UserCog } from 'lucide-react';
import { taskApi } from '../../api';

export function MemberDetail({ member, onClose }) {
    const { tasks } = useTasks();
    const { currentUser, updateUserTeam } = useUser();
    const navigate = useNavigate();
    const isAdmin = currentUser?.role === 'Admin';
    const isSelf = currentUser?.id === member.id;

    const [selectedTeam, setSelectedTeam] = useState(member.team || '');
    const [savingTeam, setSavingTeam] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

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

    const handleTeamChange = async (newTeam) => {
        setSelectedTeam(newTeam);
        setSavingTeam(true);
        try {
            await updateUserTeam(member.id, newTeam);
        } catch (err) {
            console.error('Failed to update team:', err);
        } finally {
            setSavingTeam(false);
        }
    };

    const handleChatClick = async () => {
        setChatLoading(true);
        try {
            await taskApi.getOrCreateDirectConversation(member.id);
            if (onClose) onClose();
            navigate('/chat');
        } catch (err) {
            console.error('Failed to start chat:', err);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200"
                />
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium border border-slate-200">
                            {member.role}
                        </span>
                        {member.team && (
                            <span className={`px-2 py-0.5 rounded-full text-sm font-medium border ${member.team === 'Tech Team' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    member.team === 'PR Team' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                        member.team === 'Business Development Team' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                {member.team}
                            </span>
                        )}
                    </div>
                </div>
                {/* Chat button — don't show for yourself */}
                {!isSelf && (
                    <Button
                        variant="outline"
                        className="gap-2 shrink-0"
                        onClick={handleChatClick}
                        disabled={chatLoading}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {chatLoading ? 'Opening...' : 'Chat'}
                    </Button>
                )}
            </div>

            {/* Admin: Assign team */}
            {isAdmin && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <UserCog className="w-5 h-5 text-slate-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 shrink-0">Assign Team:</span>
                    <Select
                        value={selectedTeam}
                        onChange={(e) => handleTeamChange(e.target.value)}
                        className="flex-1"
                        disabled={savingTeam}
                    >
                        <option value="">No team</option>
                        <option value="Tech Team">Tech Team</option>
                        <option value="PR Team">PR Team</option>
                        <option value="Business Development Team">Business Development Team</option>
                    </Select>
                    {savingTeam && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
                </div>
            )}

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
