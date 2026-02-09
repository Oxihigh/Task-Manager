import { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useTasks } from '../context/TaskContext';
import { MemberCard } from '../components/members/MemberCard';
import { MemberForm } from '../components/members/MemberForm';
import { MemberDetail } from '../components/members/MemberDetail';
import { Modal } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export default function Members() {
    const { users } = useUser();
    const { tasks, searchQuery } = useTasks(); // Required to calc stats
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Calculate stats for each member
    const membersWithStats = useMemo(() => {
        return users
            .filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(user => {
                const userTasks = tasks.filter(t => t.assigneeId === user.id);
                const total = userTasks.length;
                const completed = userTasks.filter(t => t.status === 'Completed').length;
                const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
                return { ...user, taskCount: total, completionRate: rate };
            });
    }, [users, tasks, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
                    <p className="text-slate-500">Manage your team and view performance</p>
                </div>
                <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add Member
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {membersWithStats.map(member => (
                    <div key={member.id} onClick={() => setSelectedMember(member)} className="cursor-pointer">
                        <MemberCard user={member} />
                    </div>
                ))}
            </div>

            {/* Add Member Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Member"
            >
                <MemberForm onClose={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* View Member Detail Modal */}
            <Modal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                title="Member Details"
                className="max-w-3xl"
            >
                {selectedMember && <MemberDetail member={selectedMember} />}
            </Modal>
        </div>
    );
}
