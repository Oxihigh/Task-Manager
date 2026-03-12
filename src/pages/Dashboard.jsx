import { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useUser } from '../context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Activity, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
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
        const myTasks = tasks.filter(t => (t.assigneeIds || []).includes(currentUser.id) && t.status !== 'Completed').length;

        const workload = users.map(u => ({
            name: u.name,
            count: tasks.filter(t => (t.assigneeIds || []).includes(u.id) && t.status !== 'Completed').length,
            avatar: u.avatar
        })).sort((a, b) => b.count - a.count);

        return { total, completed, pending, inProgress, overdue, highPriority, myTasks, workload };
    }, [tasks, currentUser.id, users]);

    const statCards = [
        {
            title: 'Total Tasks',
            value: stats.total,
            icon: Activity,
            gradient: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            subtext: `${stats.completed} completed`,
        },
        {
            title: 'In Progress',
            value: stats.inProgress,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            subtext: `${stats.pending} pending`,
        },
        {
            title: 'Overdue',
            value: stats.overdue,
            icon: AlertCircle,
            gradient: 'from-red-500 to-rose-500',
            bg: 'bg-red-50',
            text: 'text-red-600',
            subtext: `${stats.highPriority} high priority`,
        },
        {
            title: 'Assigned to Me',
            value: stats.myTasks,
            icon: CheckCircle2,
            gradient: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            subtext: 'Keep it up!',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, {currentUser.name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {format(new Date(), 'EEEE, MMMM d')}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ title, value, icon: Icon, gradient, bg, text, subtext }) => (
                    <Card key={title} className="hover:shadow-card-hover transition-all duration-300 group">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                                    <p className="text-xs text-slate-400">{subtext}</p>
                                </div>
                                <div className={cn("p-2.5 rounded-xl bg-gradient-to-br shadow-sm", gradient)}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0 max-h-[320px] overflow-y-auto">
                            {tasks.slice(0, 6).map((task, i) => (
                                <div key={task.id} className="flex items-start gap-4 py-3.5 border-b border-slate-50 last:border-0">
                                    <div className="mt-1.5">
                                        <div className={cn("w-2 h-2 rounded-full",
                                            task.status === 'Completed' ? 'bg-emerald-400' :
                                                task.status === 'In Progress' ? 'bg-blue-400' :
                                                    task.status === 'Blocked' ? 'bg-red-400' : 'bg-amber-400'
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {task.title}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {task.status} • Due {format(new Date(task.dueDate), 'MMM d')}
                                        </p>
                                    </div>
                                    <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-semibold shrink-0",
                                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                task.status === 'Blocked' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                    )}>
                                        {task.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Workload Overview */}
                <Card className="col-span-3">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Team Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.workload.slice(0, 5).map(member => (
                                <div key={member.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2.5">
                                            <img src={member.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-100" />
                                            <span className="font-medium text-slate-700 text-xs">{member.name}</span>
                                        </div>
                                        <span className="text-slate-400 text-xs font-medium">{member.count}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500",
                                                member.count > 5 ? "bg-gradient-to-r from-red-400 to-red-500" :
                                                    member.count > 2 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                                        "bg-gradient-to-r from-emerald-400 to-emerald-500"
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
