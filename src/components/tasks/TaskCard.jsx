import { format } from 'date-fns';
import { Card, CardContent } from '../ui/card';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

export function TaskCard({ task, onClick }) {
    return (
        <Card
            className="hover:shadow-card-hover transition-all duration-300 cursor-pointer group border-slate-200/80"
            onClick={onClick}
        >
            <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">#{task.id}</span>
                        {task.team && (
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                                task.team === 'Tech Team' ? 'bg-blue-50 text-blue-600' :
                                    task.team === 'PR Team' ? 'bg-pink-50 text-pink-600' :
                                        task.team === 'Business Development Team' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-slate-50 text-slate-500'
                            )}>
                                {task.team?.replace(' Team', '')}
                            </span>
                        )}
                    </div>
                    <PriorityBadge priority={task.priority} />
                </div>

                <div>
                    <h4 className="font-semibold text-slate-800 line-clamp-1 text-[15px] group-hover:text-primary-700 transition-colors">{task.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed">{task.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                    <div className="flex items-center gap-2">
                    </div>
                    <div className="flex items-center gap-3">
                        {task.dueDate && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                            </div>
                        )}
                        <StatusBadge status={task.status} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
