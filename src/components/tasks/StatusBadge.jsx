import { cn } from "../../lib/utils";

const statusStyles = {
    'Pending': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-amber-100 text-amber-800',
    'Blocked': 'bg-red-100 text-red-800',
    'Completed': 'bg-emerald-100 text-emerald-800'
};

const priorityStyles = {
    'Low': 'text-slate-500 bg-slate-50 border-slate-200',
    'Medium': 'text-amber-600 bg-amber-50 border-amber-200',
    'High': 'text-orange-600 bg-orange-50 border-orange-200',
    'Urgent': 'text-red-600 bg-red-50 border-red-200'
};

export function StatusBadge({ status, className }) {
    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[status], className)}>
            {status}
        </span>
    );
}

export function PriorityBadge({ priority, className }) {
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium", priorityStyles[priority], className)}>
            {priority}
        </span>
    );
}
