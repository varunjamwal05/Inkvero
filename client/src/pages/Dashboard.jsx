import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, Star, Plus, MoreVertical, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCover from '../components/BookCover';

const Dashboard = () => {
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [completedBook, setCompletedBook] = useState(null);

    const handleRemove = async (e, bookId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Remove this book from your library?')) return;
        try {
            await api.delete(`/interactions/${bookId}`);
            setLibrary(prev => prev.filter(item => item.book && item.book._id !== bookId));
            setActiveMenu(null);
        } catch (err) {
            console.error('Failed to remove book:', err);
        }
    };

    const handleUpdateStatus = async (e, bookId, status, progress, totalPages) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        try {
            const payload = {};
            if (status) payload.status = status;
            if (progress !== undefined) payload.progress = progress;
            if (totalPages) payload.totalPages = totalPages;

            await api.post(`/interactions/${bookId}`, payload);

            setLibrary(prev => prev.map(item =>
                item.book && item.book._id === bookId ? { ...item, ...payload, personalTotalPages: payload.totalPages || item.personalTotalPages } : item
            ));
            setActiveMenu(null);

            if (progress === 100 || status === 'COMPLETED') {
                const bookItem = library.find(item => item.book && item.book._id === bookId);
                if (bookItem) {
                    setCompletedBook(bookItem.book);
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const { data } = await api.get('/interactions/my-library');
                setLibrary(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, []);

    if (loading) return <div className="text-center p-10">Loading Library...</div>;



    return (
        <div className="w-full px-6 lg:px-10 max-w-5xl mx-auto relative">
            {/* 5. Page Atmosphere - Vignette + Grain */}
            <div className="grain-overlay"></div>
            <div className="vignette-overlay"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-heading text-secondary">My Library</h1>
                    <div className="flex gap-4">
                        <Link to="/groups/create" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium px-4 py-2 btn-micro-press">
                            <Plus size={16} /> Create Group
                        </Link>
                        <Link to="/explore" className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm border border-white/5 hover:border-white/20 btn-gold-aura btn-micro-press">
                            <Plus size={18} /> Discover Books
                        </Link>
                    </div>
                </div>

                {library.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 rounded-xl border border-white/5 dashed-border">
                        <BookOpen size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-heading text-gray-400 mb-2">Your shelf is empty</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Books you add to your library will appear here.</p>
                        <Link to="/explore" className="btn-outline border-white/10 text-gray-300 hover:border-white/20 btn-micro-press">Browse Books</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                        {library.filter(item => item.book).map((item) => (
                            <Link
                                to={`/books/${item.book._id}`}
                                key={item._id}
                                className="group relative flex gap-5 p-5 bg-[#161616] border border-white/[0.06] rounded-xl transition-all duration-300 hover:bg-[#1a1a1a] hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] active:scale-[0.99]"
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                {/* Context Menu Trigger */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === item._id ? null : item._id);
                                    }}
                                    className={`absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white backdrop-blur z-30 hover:bg-black/80 transition-all ${activeMenu === item._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {/* Context Menu Dropdown */}
                                {activeMenu === item._id && (
                                    <div className="absolute top-10 right-3 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-40 overflow-hidden py-1 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={(e) => handleUpdateStatus(e, item.book._id, 'READING')}
                                            className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                        >
                                            <BookOpen size={14} className="text-amber-500" /> Mark as Reading
                                        </button>
                                        <button
                                            onClick={(e) => handleUpdateStatus(e, item.book._id, 'COMPLETED')}
                                            className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                        >
                                            <CheckCircle size={14} className="text-green-500" /> Mark Completed
                                        </button>
                                        <div className="h-px bg-white/5 my-1"></div>
                                        <button
                                            onClick={(e) => handleRemove(e, item.book._id)}
                                            className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                        >
                                            <Trash2 size={14} /> Remove from Library
                                        </button>
                                    </div>
                                )}
                                <div className="w-20 h-[7.5rem] flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                                    <BookCover
                                        src={item.book.coverUrl || 'https://placehold.co/300x450?text=No+Cover'}
                                        alt={item.book.title}
                                        className="w-full h-full rounded shadow-inner object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-200 leading-snug mb-0.5 truncate group-hover:text-amber-100 transition-colors">
                                            {item.book.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-sans truncate mb-3">{item.book.author}</p>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-px rounded border transition-colors ${item.status === 'READING'
                                                ? 'bg-amber-500/5 text-amber-500/90 border-amber-500/10 group-hover:border-amber-500/20'
                                                : item.status === 'COMPLETED'
                                                    ? 'bg-emerald-500/5 text-emerald-500/90 border-emerald-500/10 group-hover:border-emerald-500/20'
                                                    : 'bg-zinc-500/5 text-zinc-400 border-zinc-500/10 group-hover:border-zinc-500/20'
                                                }`}>
                                                {item.status.replace(/_/g, ' ').toLowerCase()}
                                            </span>
                                            {item.rating && (
                                                <span className="flex items-center text-amber-500/60 text-[10px] gap-0.5">
                                                    <Star size={10} fill="currentColor" /> {item.rating}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative group/input">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.book.files?.totalPages || 100}
                                                defaultValue={Math.round((item.progress / 100) * (item.book.files?.totalPages || 100))}
                                                onBlur={(e) => {
                                                    const page = parseInt(e.target.value);
                                                    const total = item.book.files?.totalPages || 100;
                                                    const newProgress = Math.min(100, Math.max(0, (page / total) * 100));
                                                    if (newProgress !== item.progress) {
                                                        handleUpdateStatus(e, item.book._id, undefined, newProgress);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.target.blur();
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                className="w-9 bg-[#1a1a1a] border border-white/[0.05] rounded text-center text-[11px] font-mono text-zinc-300 focus:bg-[#222] focus:border-amber-500/30 focus:text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500/10 transition-all py-0.5 px-0 [&::-webkit-inner-spin-button]:appearance-none hover:border-white/[0.1]"
                                            />
                                        </div>
                                        <div className="relative group/total-input flex items-baseline">
                                            <span className="mr-1 text-[10px] text-zinc-600 font-mono">/</span>
                                            <input
                                                type="number"
                                                min="1"
                                                defaultValue={item.personalTotalPages || item.book.files?.totalPages || 100}
                                                onBlur={(e) => {
                                                    const newTotal = parseInt(e.target.value);
                                                    if (newTotal && newTotal !== (item.personalTotalPages || item.book.files?.totalPages)) {
                                                        const currentTotal = item.personalTotalPages || item.book.files?.totalPages || 100;
                                                        const currentPage = Math.round((item.progress / 100) * currentTotal);
                                                        const newProgress = Math.min(100, Math.max(0, (currentPage / newTotal) * 100));

                                                        handleUpdateStatus(e, item.book._id, undefined, newProgress, newTotal);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') e.target.blur();
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                className="w-9 bg-transparent border border-transparent rounded text-center text-[11px] font-mono text-zinc-600 hover:bg-[#1a1a1a] hover:text-zinc-500 hover:border-white/[0.05] focus:bg-[#1a1a1a] focus:border-amber-500/30 focus:text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500/10 transition-all py-0.5 px-0 cursor-pointer [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Completion Modal */}
            {completedBook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                        <div className="text-center">
                            <div className="mb-6 relative inline-block">
                                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                                <BookCover
                                    src={completedBook.coverUrl || 'https://placehold.co/300x450?text=No+Cover'}
                                    alt={completedBook.title}
                                    className="w-24 h-36 mx-auto rounded shadow-lg relative z-10"
                                />
                                <div className="absolute -bottom-3 -right-3 bg-amber-500 text-black p-2 rounded-full border-4 border-[#161616] z-20">
                                    <CheckCircle size={16} strokeWidth={3} />
                                </div>
                            </div>

                            <h3 className="text-xl font-heading text-white mb-2">Book Completed</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                You have finished reading <span className="text-amber-500/90 italic">{completedBook.title}</span>.
                            </p>

                            <button
                                onClick={() => setCompletedBook(null)}
                                className="w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition-all text-sm font-medium tracking-wide uppercase"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Dashboard;
