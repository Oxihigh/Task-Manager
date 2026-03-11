import { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useTasks } from '../context/TaskContext';
import { MemberCard } from '../components/members/MemberCard';
import { MemberForm } from '../components/members/MemberForm';
import { MemberDetail } from '../components/members/MemberDetail';
import { Modal } from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { Plus, Users, Code2, Megaphone, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAMS = [
    { key: 'all', label: 'All Members', icon: Users, color: 'indigo' },
    { key: 'Tech Team', label: 'Tech Team', icon: Code2, color: 'blue' },
    { key: 'PR Team', label: 'PR Team', icon: Megaphone, color: 'pink' },
    { key: 'Business Development Team', label: 'Business Dev', icon: Briefcase, color: 'emerald' },
];

const TEAM_COLORS = {
    'Tech Team': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', activeBg: 'bg-blue-600', activeText: 'text-white' },
    'PR Team': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700', activeBg: 'bg-pink-600', activeText: 'text-white' },
    'Business Development Team': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', activeBg: 'bg-emerald-600', activeText: 'text-white' },
};

export default function Members() {
    const { users, currentUser } = useUser();
    const { tasks, searchQuery } = useTasks();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [activeTeam, setActiveTeam] = useState('all');
    const isAdmin = currentUser?.role === 'Admin';

    // Calculate stats for each member & filter by search
    const membersWithStats = useMemo(() => {
        return users
            .filter(user =>
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.team?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(user => {
                const userTasks = tasks.filter(t => (t.assigneeIds || []).includes(user.id));
                const total = userTasks.length;
                const completed = userTasks.filter(t => t.status === 'Completed').length;
                const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
                return { ...user, taskCount: total, completionRate: rate };
            });
    }, [users, tasks, searchQuery]);

    // Filter by active team tab
    const filteredMembers = useMemo(() => {
        if (activeTeam === 'all') return membersWithStats;
        return membersWithStats.filter(m => m.team === activeTeam);
    }, [membersWithStats, activeTeam]);

    // Group members by team for the "All" view
    const groupedByTeam = useMemo(() => {
        const groups = {};
        for (const team of ['Tech Team', 'PR Team', 'Business Development Team']) {
            const members = membersWithStats.filter(m => m.team === team);
            if (members.length > 0) groups[team] = members;
        }
        const unassigned = membersWithStats.filter(m => !m.team);
        if (unassigned.length > 0) groups['Unassigned'] = unassigned;
        return groups;
    }, [membersWithStats]);

    // Get team member count
    const getTeamCount = (teamKey) => {
        if (teamKey === 'all') return membersWithStats.length;
        return membersWithStats.filter(m => m.team === teamKey).length;
    };

    const renderMemberGrid = (members) => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map(member => (
                <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedMember(member)}
                    className="cursor-pointer"
                >
                    <MemberCard user={member} />
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
                    <p className="text-slate-500">Manage your team and view performance</p>
                </div>
                {isAdmin && (
                    <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Add Member
                    </Button>
                )}
            </div>

            {/* Team Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {TEAMS.map(team => {
                    const Icon = team.icon;
                    const isActive = activeTeam === team.key;
                    const count = getTeamCount(team.key);
                    const colors = TEAM_COLORS[team.key];

                    return (
                        <button
                            key={team.key}
                            onClick={() => setActiveTeam(team.key)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                transition-all duration-200 border
                                ${isActive
                                    ? (colors
                                        ? `${colors.activeBg} ${colors.activeText} border-transparent shadow-lg shadow-${team.color}-200`
                                        : 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-200')
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {team.label}
                            <span className={`
                                ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                                ${isActive
                                    ? 'bg-white/20 text-current'
                                    : 'bg-slate-100 text-slate-500'}
                            `}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Members Display */}
            <AnimatePresence mode="wait">
                {activeTeam === 'all' ? (
                    <motion.div
                        key="all-grouped"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {Object.entries(groupedByTeam).map(([teamName, members]) => {
                            const colors = TEAM_COLORS[teamName];
                            return (
                                <div key={teamName}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-1 h-6 rounded-full ${colors ? colors.activeBg : 'bg-slate-400'}`} />
                                        <h3 className={`text-lg font-semibold ${colors ? colors.text : 'text-slate-600'}`}>
                                            {teamName}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors ? colors.badge : 'bg-slate-100 text-slate-600'}`}>
                                            {members.length} {members.length === 1 ? 'member' : 'members'}
                                        </span>
                                    </div>
                                    {renderMemberGrid(members)}
                                </div>
                            );
                        })}
                        {Object.keys(groupedByTeam).length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                <p className="text-lg font-medium">No members found</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTeam}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {filteredMembers.length > 0 ? (
                            renderMemberGrid(filteredMembers)
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                <p className="text-lg font-medium">No members in this team</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

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
                {selectedMember && <MemberDetail member={selectedMember} onClose={() => setSelectedMember(null)} />}
            </Modal>
        </div>
    );
}
