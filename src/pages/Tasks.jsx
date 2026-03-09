import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useUser } from '../context/UserContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { BulkActions } from '../components/tasks/BulkActions';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/modal';
import { Input } from '../components/ui/input';
import { Plus, Search, Grid as GridIcon, AlignJustify } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Tasks() {
    const { tasks, searchQuery, setSearchQuery, setCreateModalOpen } = useTasks();
    const { currentUser, users } = useUser();
    const [filter, setFilter] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState([]);

    const isIntern = currentUser?.role === 'Intern';

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = filter === 'All' ? true : task.status === filter;
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [tasks, filter, searchQuery]);

    const getAssigneeNames = (assigneeIds) => {
        if (!assigneeIds || assigneeIds.length === 0) return 'Unassigned';
        const assignedUsers = users.filter(u => assigneeIds.includes(u.id));
        return assignedUsers.map(u => u.name).join(', ');
    };

    const statusColors = {
        'Pending': 'bg-amber-100 text-amber-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Completed': 'bg-green-100 text-green-800',
        'Blocked': 'bg-red-100 text-red-800'
    };

    const FilterButton = ({ label, value }) => (
        <button
            onClick={() => setFilter(value)}
            className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                filter === value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isIntern ? 'My Tasks' : 'Tasks'}
                    </h2>
                    <p className="text-slate-500">
                        {isIntern ? 'View and manage your assigned tasks' : 'Manage and track team tasks'}
                    </p>
                </div>
                {!isIntern && (
                    <div className="flex items-center gap-3">
                        <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Create Task
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <FilterButton label="All" value="All" />
                    <FilterButton label="Pending" value="Pending" />
                    <FilterButton label="In Progress" value="In Progress" />
                    <FilterButton label="Blocked" value="Blocked" />
                    <FilterButton label="Completed" value="Completed" />
                </div>

                <div className="flex justify-between items-center w-full md:w-auto gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <GridIcon className="w-4 h-4" />
                        </button>
                        <button
                            className={cn("p-1.5 rounded-md transition-colors", viewMode === 'table' ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <AlignJustify className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <div key={task.id} className="relative group">
                                <input
                                    type="checkbox"
                                    className="absolute top-4 right-4 z-10 w-4 h-4 rounded border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity checked:opacity-100 cursor-pointer"
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        if (e.target.checked) setSelectedTasks([...selectedTasks, task.id]);
                                        else setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                                    }}
                                />
                                <TaskCard task={task} onClick={() => setSelectedTaskId(task.id)} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <p>No tasks found matching your criteria.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedTasks(filteredTasks.map(t => t.id));
                                                else setSelectedTasks([]);
                                            }}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Task Title</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Status</th>
                                    <th className="px-4 py-3 hidden lg:table-cell">Priority</th>
                                    <th className="px-4 py-3 hidden sm:table-cell">Assignee(s)</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map(task => (
                                        <tr key={task.id}
                                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                                            onClick={() => setSelectedTaskId(task.id)}
                                        >
                                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                                                    checked={selectedTasks.includes(task.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedTasks([...selectedTasks, task.id]);
                                                        else setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900 border-l-[3px] border-transparent" style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }}>
                                                {task.title}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", statusColors[task.status])}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className={cn("text-xs font-medium border rounded-md px-2 py-0.5",
                                                    task.priority === 'High' ? 'text-red-700 border-red-200 bg-red-50' :
                                                        task.priority === 'Medium' ? 'text-amber-700 border-amber-200 bg-amber-50' :
                                                            'text-blue-700 border-blue-200 bg-blue-50'
                                                )}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell text-slate-600 truncate max-w-[150px]">
                                                {getAssigneeNames(task.assigneeIds || [task.assigneeId])}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-slate-500 whitespace-nowrap">
                                                {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                                            No tasks found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <BulkActions
                selectedIds={selectedTasks}
                onComplete={() => setSelectedTasks([])}
            />

            <Modal
                isOpen={!!selectedTaskId}
                onClose={() => setSelectedTaskId(null)}
                title="Task Details"
                className="max-w-3xl"
            >
                {selectedTaskId && <TaskDetail taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />}
            </Modal>
        </div>
    );
}
