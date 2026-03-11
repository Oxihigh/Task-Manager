import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, className }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className={cn(
                "relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-200/50",
                className
            )}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    {children}
                </div>
            </div>
        </div>
    );
}
