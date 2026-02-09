import { useState } from 'react';
import { format } from 'date-fns';
import { useTasks } from '../../context/TaskContext';
import { useUser } from '../../context/UserContext';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Input } from '../ui/input';
import { User, Calendar, Clock, Send, Edit2 } from 'lucide-react';

export function TaskDetail({ taskId, onClose }) {
    const { tasks, updateTaskStatus, updateTask, addComment } = useTasks();
    const { users, currentUser } = useUser();
    const task = tasks.find(t => t.id === taskId);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Multi-select state
    const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);

    if (!task) return null;

    // Handle legacy single assigneeId vs new assigneeIds array
    const currentAssigneeIds = task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []);

    // Derived permissions
    const createdBy = users.find(u => u.id === task.createdBy);
    const isAdmin = currentUser?.role === 'Admin';
    const isReporter = currentUser?.id === task.createdBy;
    const canChangeAssignee = isAdmin || isReporter;

    const handleStatusChange = async (newStatus) => {
        try {
            setError('');
            await updateTaskStatus(task.id, newStatus);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDueDateChange = async (e) => {
        try {
            setError('');
            await updateTask(task.id, { dueDate: e.target.value });
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleAssignee = async (userId) => {
        if (!canChangeAssignee) return;

        try {
            setError('');
            const newIds = currentAssigneeIds.includes(userId)
                ? currentAssigneeIds.filter(id => id !== userId)
                : [...currentAssigneeIds, userId];

            await updateTask(task.id, { assigneeIds: newIds });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleReporterChange = async (e) => {
        try {
            setError('');
            await updateTask(task.id, { createdBy: e.target.value });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        addComment(task.id, commentText);
        setCommentText('');
    };

    const handleReply = (parentId) => {
        if (!replyText.trim()) return;
        addComment(task.id, replyText, parentId);
        setReplyText('');
        setReplyingTo(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-slate-400">ID: {task.id}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
                        <p className="text-slate-900 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-4">Activity & Comments</h4>

                        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
                            {task.logs.map((log, i) => (
                                <div key={i} className="text-xs text-slate-400">
                                    <span className="font-medium text-slate-600">{users.find(u => u.id === log.userId)?.name || 'Unknown'}</span> {log.details} • {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                                </div>
                            ))}

                            {/* Render parent comments and their replies */}
                            {task.comments
                                .filter(c => !c.parentId) // Get top-level comments
                                .map((comment) => (
                                    <div key={comment.id} className="space-y-2">
                                        {/* Parent Comment */}
                                        <div className="bg-slate-50 p-3 rounded-lg flex gap-3 group">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                {users.find(u => u.id === comment.userId)?.name?.[0] || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-slate-900">{users.find(u => u.id === comment.userId)?.name}</span>
                                                    <span className="text-xs text-slate-400">{format(new Date(comment.timestamp), 'MMM d, h:mm a')}</span>
                                                </div>
                                                <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{
                                                    __html: comment.text.replace(/@(\w+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')
                                                }} />
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                    className="text-xs text-slate-400 hover:text-indigo-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reply Input */}
                                        {replyingTo === comment.id && (
                                            <div className="ml-8 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder={`Reply to ${users.find(u => u.id === comment.userId)?.name}... (use @name to mention)`}
                                                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    autoFocus
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReply(comment.id)}
                                                    disabled={!replyText.trim()}
                                                >
                                                    Send
                                                </Button>
                                            </div>
                                        )}

                                        {/* Replies (nested comments) */}
                                        {task.comments
                                            .filter(c => c.parentId === comment.id)
                                            .map((reply) => (
                                                <div key={reply.id} className="ml-8 bg-indigo-50/50 p-3 rounded-lg flex gap-3 border-l-2 border-indigo-200">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                        {users.find(u => u.id === reply.userId)?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold text-slate-900">{users.find(u => u.id === reply.userId)?.name}</span>
                                                            <span className="text-xs text-slate-400">{format(new Date(reply.timestamp), 'MMM d, h:mm a')}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-700" dangerouslySetInnerHTML={{
                                                            __html: reply.text.replace(/@(\w+)/g, '<span class="text-indigo-600 font-medium">@$1</span>')
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                        </div>

                        <form onSubmit={handleAddComment} className="relative">
                            <Textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Write a comment... (use @name to mention someone)"
                                className="pr-12"
                            />
                            <Button size="icon" disabled={!commentText.trim()} className="absolute right-2 bottom-2 h-8 w-8" type="submit">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-lg space-y-4 border border-slate-100">
                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Status</span>
                            <Select
                                value={task.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="mt-1"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Completed">Completed</option>
                            </Select>
                        </div>

                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Assignees</span>
                            <div className="mt-1 relative">
                                <div
                                    className={`min-h-[38px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background flex flex-wrap gap-1 ${canChangeAssignee ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                    onClick={() => canChangeAssignee && setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                                >
                                    {currentAssigneeIds.length === 0 && <span className="text-slate-500">Unassigned</span>}
                                    {currentAssigneeIds.map(id => {
                                        const user = users.find(u => u.id === id);
                                        return (
                                            <span key={id} className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                                {user?.name || id}
                                                {canChangeAssignee && (
                                                    <span
                                                        className="hover:text-red-500 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleAssignee(id);
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>

                                {isAssignDropdownOpen && canChangeAssignee && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                                        {users.map(u => {
                                            const isSelected = currentAssigneeIds.includes(u.id);
                                            return (
                                                <div
                                                    key={u.id}
                                                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-sm"
                                                    onClick={() => toggleAssignee(u.id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                                                            {u.name[0]}
                                                        </div>
                                                        <span className={isSelected ? 'font-medium' : ''}>{u.name}</span>
                                                    </div>
                                                    {isSelected && <span className="text-indigo-600">✓</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {!canChangeAssignee && (
                                <p className="text-[10px] text-slate-400 mt-1">Only Admin or Task Reporter can change assignees</p>
                            )}
                        </div>

                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Due Date</span>
                            <Input
                                type="date"
                                value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                                onChange={handleDueDateChange}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <span className="text-xs font-medium text-slate-500 uppercase">Reporter</span>
                            {isAdmin ? (
                                <Select
                                    value={task.createdBy || ''}
                                    onChange={handleReporterChange}
                                    className="mt-1"
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-700">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {createdBy?.name || 'Unknown'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

