import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Modal } from '../ui/modal';
import { TaskForm } from '../tasks/TaskForm';
import { useTasks } from '../../context/TaskContext';

export function Layout() {
    const { isCreateModalOpen, setCreateModalOpen } = useTasks();

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Header />
                <main className="p-8 flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>

            {/* Global Task Creation Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Create New Task"
            >
                <TaskForm onClose={() => setCreateModalOpen(false)} />
            </Modal>
        </div>
    );
}
