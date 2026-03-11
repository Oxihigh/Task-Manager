import { Search } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTasks } from '../../context/TaskContext';
import { Notifications } from './Notifications';
import { useNavigate } from 'react-router-dom';

export function Header() {
    const { currentUser } = useUser();
    const { searchQuery, setSearchQuery } = useTasks();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim() &&
            window.location.pathname !== '/tasks' &&
            window.location.pathname !== '/members') {
            navigate('/tasks');
        }
    };

    return (
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 w-full">
            <div className="flex items-center bg-slate-100/80 rounded-xl px-4 py-2.5 w-96 group focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white focus-within:border-primary-200 border border-transparent transition-all duration-200">
                <Search className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-primary-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search tasks, members..."
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>

            <div className="flex items-center gap-3">
                <Notifications />
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200/80">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-400">{currentUser?.role}</p>
                    </div>
                    {currentUser?.avatar && (
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-9 h-9 rounded-full border-2 border-slate-100"
                        />
                    )}
                </div>
            </div>
        </header>
    );
}
