import { cn } from "../../lib/utils";

export function Select({ className, children, ...props }) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200 appearance-none cursor-pointer",
                    className
                )}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    );
}
