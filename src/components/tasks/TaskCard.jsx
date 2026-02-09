import { format } from 'date-fns';

import { Card, CardContent } from '../ui/card';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Calendar } from 'lucide-react';

export function TaskCard({ task, onClick }) {


    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <span className="text-xs font-mono text-slate-400">#{task.id}</span>
                    <PriorityBadge priority={task.priority} />
                </div>

                <div>
                    <h4 className="font-semibold text-slate-900 line-clamp-1">{task.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{task.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-2">
                    </div>

                    <div className="flex items-center gap-4">
                        {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3.5 h-3.5" />
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
