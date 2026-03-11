import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md",
                destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
                outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
                secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
                ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
                link: "text-primary-600 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-9 rounded-lg px-3.5 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10 rounded-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export function Button({ className, variant, size, ...props }) {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}
