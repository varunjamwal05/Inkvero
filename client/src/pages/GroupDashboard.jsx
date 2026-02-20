import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, Copy, Share2, Trash2 } from 'lucide-react';
import BookCover from '../components/BookCover';

const GroupDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copyAck, setCopyAck] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [messagesLoading, setMessagesLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const { data } = await api.get(`/groups/${id}`);
                setGroupData(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/groups/${id}/messages`);
                setMessages(data.data);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            } finally {
                setMessagesLoading(false);
            }
        };

        fetchGroup();
        fetchMessages();
    }, [id]);

    const handlePostMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            const { data } = await api.post(`/groups/${id}/messages`, {
                content: messageInput,
                totalPages: currentTotalPages
            });
            setMessages(prev => [...prev, data.data]);
            setMessageInput('');
        } catch (err) {
            console.error('Failed to post message:', err);
            toast.error('Failed to post message');
        }
    };

    useEffect(() => {
        if (groupData?.group?.currentBook?.files?.totalPages && groupData.myProgress !== undefined) {
            const total = groupData.group.currentBook.files.totalPages;
            setPageInput(Math.round((groupData.myProgress / 100) * total));
        }
    }, [groupData]);

    const copyCode = () => {
        navigator.clipboard.writeText(groupData.group.joinCode);
        setCopyAck(true);
        setTimeout(() => setCopyAck(false), 2000);
    };

    const handleProgressUpdate = async (newProgress) => {
        // Optimistic update?
        try {
            await api.put(`/groups/${id}/progress`, { progress: newProgress });
            // Reload logic slightly complex, maybe simplified for now
            // Just update local state for current user member
            setGroupData(prev => ({
                ...prev,
                myProgress: newProgress
            }));

            // Refresh messages if progress changed (might unlock new messages)
            const { data } = await api.get(`/groups/${id}/messages`);
            setMessages(data.data);

            if (newProgress === 100) {
                setShowCompletionModal(true);
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleDeleteGroup = async () => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Are you sure you want to delete this group? This action cannot be undone.</p>
                <div className="flex gap-2 justify-end mt-1">
                    <button
                        className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-xs transition-colors"
                        onClick={() => {
                            toast.dismiss(t.id);
                            deleteGroup();
                        }}
                    >
                        Delete
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

    const deleteGroup = async () => {
        try {
            await api.delete(`/groups/${id}`);
            toast.success('Group deleted successfully');
            navigate('/groups');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to delete group');
        }
    };

    const handleLeaveGroup = async () => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Are you sure you want to leave this circle?</p>
                <div className="flex gap-2 justify-end mt-1">
                    <button
                        className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-xs transition-colors"
                        onClick={() => {
                            toast.dismiss(t.id);
                            leaveGroup();
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

    const leaveGroup = async () => {
        try {
            await api.post(`/groups/${id}/leave`);
            toast.success('Left group successfully');
            navigate('/groups');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to leave group');
        }
    };

    const handleBanUser = async (userId, isBanned) => {
        const action = isBanned ? 'unban' : 'ban';
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Are you sure you want to {action} this user?</p>
                <div className="flex gap-2 justify-end mt-1">
                    <button
                        className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded text-xs transition-colors uppercase tracking-wider"
                        onClick={() => {
                            toast.dismiss(t.id);
                            banUser(userId, isBanned);
                        }}
                    >
                        Confirm
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

    const banUser = async (userId, isBanned) => {
        try {
            // Optimistic update
            setGroupData(prev => ({
                ...prev,
                members: prev.members.map(m => m.user._id === userId ? { ...m, user: { ...m.user, isBanned: !isBanned } } : m)
            }));

            if (isBanned) {
                await api.patch(`/admin/users/${userId}/unban`);
            } else {
                await api.patch(`/admin/users/${userId}/ban`);
            }
            toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
        } catch (err) {
            console.error(err);
            // Revert on failure
            // Re-fetch group data to revert optimistic update and get fresh state
            const { data } = await api.get(`/groups/${id}`);
            setGroupData(data.data);
            toast.error('Failed to update user status');
        }
    };

    if (loading) return <div className="text-center p-10">Loading Group...</div>;
    if (!groupData) return <div className="text-center p-10">Group not found</div>;

    const { group, members, myProgress } = groupData;
    const isOwner = user?.role === 'admin' ||
        (group.creator?._id?.toString() === user?._id?.toString()) ||
        (typeof group.creator === 'string' && group.creator === user?._id?.toString());
    const currentTotalPages = group.totalPages || group.currentBook?.files?.totalPages || 100;

    const handleTotalPagesUpdate = async (newTotal) => {
        if (!newTotal || isNaN(newTotal) || newTotal <= 0) return;
        try {
            const { data } = await api.patch(`/groups/${id}`, { totalPages: parseInt(newTotal) });
            setGroupData(prev => ({
                ...prev,
                group: { ...prev.group, totalPages: data.data.totalPages }
            }));
        } catch (err) {
            console.error(err);
            toast.error('Failed to update total pages');
        }
    };

    // Main Content: Discussion
    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="relative overflow-hidden bg-[#161616] border border-white/5 rounded-xl p-6 lg:p-8 mb-6 shadow-xl shadow-black/40 group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover:scale-105">
                    <Users size={150} className="text-white" />
                </div>

                {/* Group Actions */}
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    {isOwner && (
                        <button
                            onClick={handleDeleteGroup}
                            className="bg-red-900/10 hover:bg-red-900/20 text-red-500 border border-red-500/10 hover:border-red-500/30 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase transition-all duration-300 flex items-center gap-2"
                        >
                            Delete Group
                        </button>
                    )}

                    {(group.creator?._id !== user?._id && group.creator !== user?._id && user?.role !== 'admin') && (
                        <button
                            onClick={handleLeaveGroup}
                            className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-widest uppercase transition-all duration-300 flex items-center gap-2"
                        >
                            Leave Group
                        </button>
                    )}
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
                    <BookCover
                        src={group.currentBook?.coverUrl || 'https://placehold.co/300x450?text=No+Cover'}
                        alt={group.currentBook?.title || 'Unknown Book'}
                        className="w-24 md:w-32 lg:w-36 shadow-lg shadow-black/80 rotate-1 hover:rotate-0 transition-transform duration-500 ease-out"
                        imgClassName="object-cover rounded-md"
                    />
                    <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-white leading-tight">{group.name}</h1>
                            <span className="bg-amber-500/10 text-amber-500 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/20">Active</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-2xl text-sm font-light leading-relaxed tracking-wide">{group.description}</p>

                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="bg-white/5 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 backdrop-blur-sm group/item hover:bg-white/10 transition-colors">
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest">Current Read</span>
                                <span className="font-heading text-gray-200 text-sm group-hover/item:text-white transition-colors">{group.currentBook?.title || 'Unknown Book'}</span>
                            </div>

                            <div
                                className="bg-white/5 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 cursor-pointer hover:bg-amber-500/10 hover:border-amber-500/20 transition-all duration-300 group/code"
                                onClick={copyCode}
                            >
                                <span className="text-[9px] text-gray-500 uppercase tracking-widest group-hover/code:text-amber-500/70 transition-colors">Invite Code</span>
                                <span className="font-mono text-amber-500 text-sm flex items-center gap-2">
                                    {group.joinCode} <Copy size={12} className="opacity-50 group-hover/code:opacity-100 transition-opacity" />
                                </span>
                            </div>

                            <button
                                className="bg-white text-black px-4 py-2 rounded-full border border-transparent font-medium text-xs tracking-wide flex items-center gap-2 hover:bg-amber-400 hover:scale-105 transition-all duration-300 shadow-md shadow-white/5"
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/join/${group.joinCode}`);
                                    toast.success('Link copied to clipboard!');
                                }}
                            >
                                <Share2 size={12} /> Share Link
                            </button>
                            {copyAck && <span className="text-amber-400 text-[10px] tracking-widest uppercase animate-in fade-in zoom-in duration-300">Copied!</span>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-light tracking-wide text-white/90 mb-6">Reading Notes</h3>
                    <div className="bg-[#141414] border border-white/[0.03] rounded-xl flex flex-col h-[650px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
                        {/* Reading Guide Vertical Line */}
                        <div className="absolute left-[75px] top-0 bottom-0 w-px bg-white/[0.02] pointer-events-none"></div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-thin scrollbar-thumb-white/[0.02]">
                            {messagesLoading ? (
                                <div className="h-full flex items-center justify-center text-gray-700 italic text-sm font-light tracking-[0.2em] animate-pulse">Gathering marginalia...</div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-800 italic text-sm space-y-6 font-light">
                                    <BookOpen size={20} className="opacity-5" />
                                    <p className="tracking-widest">Awaiting the first annotation.</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg._id} className="group/msg animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                        <div className="flex items-start gap-8 relative">
                                            <div className="opacity-20 group-hover/msg:opacity-60 transition-all duration-700 shrink-0 pt-1">
                                                <div className="w-6 h-6 rounded-sm bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-light text-gray-300 uppercase tracking-tighter">
                                                    {msg.user?.username?.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 pl-1">
                                                <div className="flex items-baseline justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] text-amber-500/40 font-medium uppercase tracking-[0.3em] transition-colors group-hover/msg:text-amber-500/80">p.{msg.page || Math.round((msg.progress / 100) * currentTotalPages)}</span>
                                                        <span className="text-[10px] text-zinc-600 font-light tracking-wide truncate max-w-[150px] transition-colors group-hover/msg:text-zinc-400">{msg.user?.username}</span>
                                                    </div>
                                                    <span className="text-[9px] text-black/40 group-hover/msg:text-white/5 font-light tracking-widest uppercase transition-colors">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-[15px] text-zinc-200 font-light leading-relaxed tracking-wide antialiased transition-all duration-500 group-hover/msg:text-white group-hover/msg:translate-x-1">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-10 bg-[#181818]/80 backdrop-blur-md border-t border-white/[0.02] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                            <form onSubmit={handlePostMessage} className="relative group/form">
                                <input
                                    type="text"
                                    placeholder="Add a thought to the margins..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/5 rounded-none pb-6 text-sm text-zinc-300 placeholder:text-zinc-800 focus:outline-none focus:border-amber-500/30 transition-all font-light tracking-widest italic selection:bg-amber-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="absolute right-0 bottom-6 text-[9px] text-zinc-700 uppercase tracking-[0.4em] font-medium hover:text-amber-500 transition-all disabled:opacity-0 translate-y-2 group-focus-within/form:translate-y-0"
                                >
                                    Record
                                </button>
                            </form>
                            <div className="mt-4 text-[8px] text-zinc-800 uppercase tracking-[0.3em] font-light flex justify-between items-baseline italic">
                                <span className="transition-colors group-focus-within/form:text-zinc-600">Anchored at Page {pageInput || 0}</span>
                                <span className="opacity-0 group-focus-within/form:opacity-100 transition-opacity translate-x-4 group-focus-within/form:translate-x-0 duration-500">Visible to explorers on this page</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Sidebar: Leaderboard */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-light tracking-wide text-white mb-4 flex items-center gap-2">
                        <Users size={16} className="text-amber-500" /> Group Members
                    </h3>
                    <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                        {members.map((member, idx) => (
                            <div key={member._id} className="p-3 border-b border-white/5 last:border-0 flex items-center gap-3 group hover:bg-white/[0.02] transition-colors">
                                <div className="font-mono text-gray-600 w-5 text-center text-[10px]">{idx + 1}</div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 overflow-hidden shadow-inner">
                                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-300">
                                        {member.user.username.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs text-gray-200 flex items-center gap-2 mb-1 truncate">
                                        {member.user.username}
                                        {member.user.isBanned && <span className="text-[8px] uppercase tracking-widest text-red-500 bg-red-900/10 px-1 py-0.5 rounded border border-red-500/20">BANNED</span>}
                                    </p>
                                    <div className="w-full bg-gray-800/50 rounded-full h-1 overflow-hidden">
                                        <div className="bg-amber-500 h-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity" style={{ width: `${member.progress}%` }}></div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono tabular-nums">
                                    {Math.round((member.progress / 100) * currentTotalPages)} / {currentTotalPages}
                                </span>

                                {user?.role === 'admin' && member.user._id !== user._id && (
                                    <button
                                        onClick={() => handleBanUser(member.user._id, member.user.isBanned)}
                                        className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${member.user.isBanned ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                        title={member.user.isBanned ? "Unban User" : "Ban User"}
                                    >
                                        <Users size={12} />
                                    </button>
                                )}

                                {isOwner && member.user._id !== user._id && (
                                    <button
                                        onClick={() => {
                                            toast((t) => (
                                                <div className="flex flex-col gap-2">
                                                    <p className="font-medium text-sm">Are you sure you want to remove this member?</p>
                                                    <div className="flex gap-2 justify-end mt-1">
                                                        <button
                                                            className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-xs transition-colors"
                                                            onClick={() => {
                                                                toast.dismiss(t.id);
                                                                handleRemoveMember(member.user._id);
                                                            }}
                                                        >
                                                            Remove
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
                                        }}
                                        className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500/10 text-red-400 hover:bg-red-500/20 ml-1"
                                        title="Remove Member"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Update Progress Widget */}
                    <div className="mt-6 bg-[#161616] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h4 className="font-light tracking-wide text-white mb-4 text-xs uppercase">Update Your Progress</h4>
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative group/input flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max={currentTotalPages}
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    onBlur={() => {
                                        const page = parseInt(pageInput);
                                        const total = currentTotalPages;
                                        if (!isNaN(page)) {
                                            const newProgress = Math.min(100, Math.max(0, (page / total) * 100));
                                            handleProgressUpdate(newProgress);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.target.blur();
                                        }
                                    }}
                                    className="w-full bg-transparent border-b border-white/10 text-xl font-heading text-white focus:border-amber-500 focus:outline-none transition-colors py-2 text-center"
                                />
                                <div className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 transition-all duration-300 group-hover/input:w-full"></div>
                                <label className="absolute -top-3 left-0 text-[9px] uppercase tracking-widest text-gray-500">Current Page</label>
                            </div>
                            <div className="text-2xl font-light text-gray-600">/</div>
                            <div className="flex-1 text-center">
                                {isOwner ? (
                                    <input
                                        key={currentTotalPages}
                                        type="number"
                                        className="w-full bg-transparent border-b border-white/10 text-xl font-heading text-white focus:border-amber-500 focus:outline-none transition-colors py-2 text-center"
                                        defaultValue={currentTotalPages}
                                        onBlur={(e) => handleTotalPagesUpdate(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.target.blur();
                                        }}
                                    />
                                ) : (
                                    <div className="text-xl font-heading text-gray-400">{currentTotalPages}</div>
                                )}
                                <div className="text-[9px] uppercase tracking-widest text-gray-600 mt-1">Total Pages</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completion Modal */}
            {
                showCompletionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                            <div className="text-center">
                                <div className="mb-6 relative inline-block">
                                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                                    <BookCover
                                        src={group.currentBook?.coverUrl || 'https://placehold.co/300x450?text=No+Cover'}
                                        alt={group.currentBook?.title}
                                        className="w-24 h-36 mx-auto rounded shadow-lg relative z-10"
                                    />
                                    <div className="absolute -bottom-3 -right-3 bg-amber-500 text-black p-2 rounded-full border-4 border-[#161616] z-20">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>

                                <h3 className="text-xl font-heading text-white mb-2">Journey Completed</h3>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                    You have finished reading <span className="text-amber-500/90 italic">{group.currentBook?.title}</span>.
                                </p>

                                <button
                                    onClick={() => setShowCompletionModal(false)}
                                    className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-all text-sm font-medium tracking-wide uppercase"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default GroupDashboard;
