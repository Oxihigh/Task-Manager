import { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useUser } from '../context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
    const { tasks } = useTasks();
    const { currentUser, users } = useUser();

    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const pending = tasks.filter(t => t.status === 'Pending').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
        const highPriority = tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length;
        const myTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== 'Completed').length;

        // Calculate workload
        const workload = users.map(u => ({
            name: u.name,
            count: tasks.filter(t => t.assigneeId === u.id && t.status !== 'Completed').length,
            avatar: u.avatar
        })).sort((a, b) => b.count - a.count);

        return { total, completed, pending, inProgress, overdue, highPriority, myTasks, workload };
    }, [tasks, currentUser.id, users]);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                        <div className={cn("p-2 rounded-full", color)}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{title}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                        </div>
                    </div>
                </div>
                {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">Welcome back, {currentUser.name}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tasks"
                    value={stats.total}
                    icon={Activity}
                    color="bg-blue-500"
                    subtext={`${stats.completed} completed`}
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={Clock}
                    color="bg-amber-500"
                    subtext={`${stats.pending} pending`}
                />
                <StatCard
                    title="Overdue"
                    value={stats.overdue}
                    icon={AlertCircle}
                    color="bg-red-500"
                    subtext={`${stats.highPriority} high priority`}
                />
                <StatCard
                    title="Assigned to Me"
                    value={stats.myTasks}
                    icon={CheckCircle2}
                    color="bg-emerald-500"
                    subtext="Keep it up!"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8 max-h-[300px] overflow-y-auto pr-2">
                            {/* Dynamically generating logs from tasks would be better, but context structure makes aggregating hard efficiently without proper backend. 
                    So we'll use a mocked list or just latest task updates. For now, showing recent tasks created/updated.
                */}
                            {tasks.slice(0, 5).map((task, i) => (
                                <div key={task.id} className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Task <span className="text-slate-700 font-bold">"{task.title}"</span> is {task.status}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Assigned to {users.find(u => u.id === task.assigneeId)?.name || 'Unassigned'} • Due {format(new Date(task.dueDate), 'MMM d')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Workload Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {stats.workload.slice(0, 5).map(member => (
                                <div key={member.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <img src={member.avatar} alt="" className="w-5 h-5 rounded-full" />
                                            <span className="font-medium text-slate-700">{member.name}</span>
                                        </div>
                                        <span className="text-slate-500 text-xs">{member.count} tasks</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all",
                                                member.count > 5 ? "bg-red-500" : member.count > 2 ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min((member.count / 8) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
