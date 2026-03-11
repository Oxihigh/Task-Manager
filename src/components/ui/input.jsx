import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200",
                className
            )}
            {...props}
        />
    );
}
