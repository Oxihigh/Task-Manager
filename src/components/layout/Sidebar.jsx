import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, PlusCircle, LogOut, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useTasks } from '../../context/TaskContext';
import { useUser } from '../../context/UserContext';

export function Sidebar() {
    const location = useLocation();
    const { setCreateModalOpen } = useTasks();
    const { logout, currentUser } = useUser();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { label: 'Kanban', icon: CheckSquare, path: '/kanban' },
        { label: 'Members', icon: Users, path: '/members' },
        { label: 'Chat', icon: MessageSquare, path: '/chat' },
    ];

    return (
        <div className="w-[260px] border-r border-slate-200/80 bg-white flex flex-col h-screen fixed left-0 top-0 z-20">
            {/* Logo */}
            <div className="px-6 pt-6 pb-2">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="Bareddy's" className="h-10 w-auto" />
                </Link>
            </div>

            {/* Quick Action */}
            <div className="px-4 py-4">
                <Button
                    className="w-full justify-center gap-2 shadow-sm"
                    size="default"
                    onClick={() => setCreateModalOpen(true)}
                >
                    <PlusCircle className="w-4 h-4" />
                    New Task
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-0.5">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-primary-50 text-primary-700 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            <Icon className={cn("w-[18px] h-[18px]", isActive && "text-primary-600")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-2 mb-3">
                    {currentUser?.avatar && (
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-8 h-8 rounded-full border border-slate-200"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser?.role}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
