import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, PlusCircle, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useTasks } from '../../context/TaskContext';
import { useUser } from '../../context/UserContext';

export function Sidebar() {
    const location = useLocation();
    const { setCreateModalOpen } = useTasks();
    const { logout } = useUser();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { label: 'Kanban', icon: CheckSquare, path: '/kanban' },
        { label: 'Members', icon: Users, path: '/members' },
    ];

    return (
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-10">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                        T
                    </div>
                    <span className="text-xl font-bold text-slate-900">TaskFlow</span>
                </Link>

                <Button
                    className="w-full justify-start gap-2 mb-6"
                    size="lg"
                    onClick={() => setCreateModalOpen(true)}
                >
                    <PlusCircle className="w-5 h-5" />
                    New Task
                </Button>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 mt-auto border-t border-slate-200">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
