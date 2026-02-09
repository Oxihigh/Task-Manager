import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { cn } from '../../lib/utils';

export function Notifications() {
    const { currentUser } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Poll for notifications every 30s or on mount
    const fetchNotifications = async () => {
        if (!currentUser) return;
        // Note: JSON-server doesn't support complex filtering well on nested arrays purely by itself without custom routes sometimes,
        // but the standard is GET /notifications?userId=X
        try {
            const res = await axios.get(`http://localhost:3000/notifications?userId=${currentUser.id}&read=false&_sort=timestamp&_order=desc`);
            setNotifications(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const markRead = async (id) => {
        try {
            await axios.patch(`http://localhost:3000/notifications/${id}`, { read: true });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) { console.error(e); }
    };

    // Close when clicking outside - simplified for demo using a transparent overlay
    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                            <span className="text-xs text-slate-500">{notifications.length} unread</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => markRead(n.id)}
                                        className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        <p className="text-sm text-slate-700">{n.text}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
