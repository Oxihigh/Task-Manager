import { useState } from 'react';
import { Search } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTasks } from '../../context/TaskContext';
import { Notifications } from './Notifications';
import { ProfileSettings } from '../profile/ProfileSettings';
import { Modal } from '../ui/modal';
import { useNavigate } from 'react-router-dom';

export function Header() {
    const { currentUser } = useUser();
    const { searchQuery, setSearchQuery } = useTasks();
    const navigate = useNavigate();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // Only redirect to tasks if we are NOT on members page
        if (e.target.value.trim() &&
            window.location.pathname !== '/tasks' &&
            window.location.pathname !== '/members') {
            navigate('/tasks');
        }
    };

    return (
        <>
            <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10 w-full">
                <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 w-96">
                    <Search className="w-4 h-4 text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications Component */}
                    <Notifications />

                    <div
                        className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsProfileModalOpen(true)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-900">{currentUser?.name}</p>
                            <p className="text-xs text-slate-500">{currentUser?.role}</p>
                        </div>
                        {currentUser?.avatar && (
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
                            />
                        )}
                    </div>
                </div>
            </header>

            <Modal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                title="Profile"
                className="max-w-2xl"
            >
                <ProfileSettings />
            </Modal>
        </>
    );
}
