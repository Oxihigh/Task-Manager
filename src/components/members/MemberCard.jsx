import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '../../context/TaskContext';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function MemberCard({ user }) {
    const { tasks } = useTasks();

    const stats = useMemo(() => {
        const userTasks = tasks.filter(t => t.assigneeId === user.id);
        const total = userTasks.length;
        const completed = userTasks.filter(t => t.status === 'Completed').length;
        const pending = userTasks.filter(t => t.status === 'Pending').length;
        const inProgress = userTasks.filter(t => t.status === 'In Progress').length;
        const overdue = userTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, pending, inProgress, overdue, completionRate };
    }, [tasks, user.id]);

    return (
        <motion.div
            whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
        >
            <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-200 cursor-pointer group">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <motion.div
                            whileHover={{ rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.4 }}
                        >
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full border-2 border-slate-200 group-hover:border-indigo-300 transition-colors duration-300"
                            />
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300">{user.name}</h3>
                            <p className="text-xs text-slate-500 group-hover:text-indigo-500 transition-colors duration-300">{user.role}</p>
                        </div>
                        <div className="ml-auto text-right">
                            {/* Completion badge on hover */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                {stats.completionRate}% done
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 group-hover:border-indigo-100 transition-colors duration-300">
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 mb-1">Assigned</span>
                            <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors duration-300">{stats.total}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-slate-100 group-hover:border-indigo-100 transition-colors duration-300">
                            <span className="text-xs text-slate-400 mb-1">Pending</span>
                            <span className="font-semibold text-amber-600">{stats.pending + stats.inProgress}</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-slate-100 group-hover:border-indigo-100 transition-colors duration-300">
                            <span className="text-xs text-slate-400 mb-1">Overdue</span>
                            <span className="font-semibold text-red-600">{stats.overdue}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

