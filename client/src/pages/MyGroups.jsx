import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Users, BookOpen, Plus, ArrowRight, MoreVertical, LogOut } from 'lucide-react';
import api from '../api/axios';

const MyGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await api.get('/groups/my-groups');
                setGroups(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const handleLeaveGroup = async (groupId, groupName) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Are you sure you want to leave "{groupName}"?</p>
                <div className="flex gap-2 justify-end mt-1">
                    <button
                        className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-xs transition-colors"
                        onClick={() => {
                            toast.dismiss(t.id);
                            leaveGroup(groupId);
                        }}
                    >
                        Leave
                    </button>
                    <button
                        className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 rounded text-xs transition-colors"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000, icon: '⚠️' });
    };

    const leaveGroup = async (groupId) => {
        try {
            await api.post(`/groups/${groupId}/leave`);
            setGroups(prev => prev.filter(g => g._id !== groupId));
            toast.success('Left group successfully');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to leave group');
        }
    };

    if (loading) {
        return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">Loading circles...</div>;
    }

    // Empty state
    if (groups.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1c1c1c] via-[#111111] to-[#050505]">
                <div className="w-20 h-20 rounded-full bg-[#181818] border border-white/5 flex items-center justify-center mb-8 shadow-2xl shadow-black/50">
                    <Users size={32} className="text-gray-600 opacity-80" />
                </div>

                <h1 className="text-3xl font-light tracking-wide text-white mb-4">
                    Your circles will appear here
                </h1>

                <p className="text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed font-light tracking-wide text-sm">
                    Join a reading circle to discuss books with others and follow conversations in real time.
                </p>

                <Link
                    to="/explore"
                    className="px-8 py-3.5 bg-white text-black rounded-full font-medium tracking-wide text-sm hover:bg-amber-500 hover:text-black transition-all duration-300 shadow-lg shadow-white/5 flex items-center gap-3 group"
                >
                    <BookOpen size={16} className="group-hover:scale-110 transition-transform duration-300" />
                    <span>Explore Books</span>
                </Link>
            </div>
        );
    }

    // Populated State
    return (
        <div className="w-full px-6 lg:px-12 max-w-7xl mx-auto py-16 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#262626] via-[#141414] to-[#0a0a0a]">
            <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-3">My Circles</h1>
                    <p className="text-gray-500 font-light tracking-wide text-sm pl-1">Communities you are part of</p>
                </div>
                <Link to="/groups/create" className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 hover:border-amber-500/30 bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <Plus size={16} className="text-gray-400 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-medium tracking-widest uppercase text-gray-300 group-hover:text-amber-400 transition-colors">New Circle</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groups.map((group) => (
                    <Link
                        key={group._id}
                        to={`/groups/${group._id}`}
                        className="group relative flex flex-col h-full bg-[#161616]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10 hover:border-amber-500/20 transition-all duration-500 ease-out overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 z-20">
                            <div className="group/menu relative">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-30">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleLeaveGroup(group._id, group.name);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={12} /> Leave Group
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all duration-300">
                                <Users size={20} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-amber-500/80 transition-colors">
                                {group.members?.length || 1} Members
                            </span>
                        </div>

                        <h3 className="text-2xl font-light tracking-wide text-white group-hover:text-amber-400 transition-colors duration-300 mb-2 line-clamp-1">
                            {group.name}
                        </h3>

                        {
                            group.currentBook ? (
                                <div className="flex items-center gap-5 mb-6 mt-4 p-4 rounded-xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
                                    <img
                                        src={group.currentBook.coverUrl || 'https://placehold.co/100x150'}
                                        alt="Book"
                                        className="w-12 h-16 object-cover rounded shadow-lg opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Reading</p>
                                        <p className="text-sm font-medium text-gray-300 line-clamp-1 group-hover:text-white transition-colors">{group.currentBook.title}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-xs text-gray-700 italic mb-6 min-h-[60px]">
                                    No book selected
                                </div>
                            )
                        }

                        < div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-sm text-gray-400" >
                            <span className="text-xs uppercase tracking-widest text-gray-600">Your Progress: <span className={group.myProgress > 0 ? "text-amber-500 ml-1 text-base font-light" : "text-gray-500 ml-1"}>{Math.round(group.myProgress || 0)}%</span></span>
                            <span className="group-hover:translate-x-2 transition-transform text-gray-600 group-hover:text-amber-500 duration-300"><ArrowRight size={16} /></span>
                        </div>
                    </Link>
                ))
                }
            </div >
        </div >
    );
};

export default MyGroups;
