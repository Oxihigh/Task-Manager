import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                "flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none",
                className
            )}
            {...props}
        />
    );
}
