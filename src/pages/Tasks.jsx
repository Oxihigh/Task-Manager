import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useUser } from '../context/UserContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { BulkActions } from '../components/tasks/BulkActions';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/modal';
import { Input } from '../components/ui/input';
import { Plus, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Tasks() {
    const { tasks, searchQuery, setSearchQuery, setCreateModalOpen } = useTasks();
    const { currentUser } = useUser();
    const [filter, setFilter] = useState('All');
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

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

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

            <BulkActions
                selectedIds={selectedTasks}
                onComplete={() => setSelectedTasks([])}
            />

            {/* Global modal is handled in Layout, but TaskDetail is still local here for viewing */}
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
