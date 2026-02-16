import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Share2, BookOpen, Star, MessageCircle, Clock, User } from 'lucide-react';
import BookCover from '../components/BookCover';

const BookDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [myState, setMyState] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const { data } = await api.get(`/books/${id}`);
                setBook(data.data);

                if (user) {
                    // Fetch groups for this book
                    try {
                        const groupsRes = await api.get(`/groups/book/${id}`);
                        setGroups(groupsRes.data.data);
                    } catch (e) {
                        console.error("Failed to fetch groups", e);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id, user]);

    const handleStatusUpdate = async (status) => {
        if (!user) return navigate('/login');
        try {
            await api.post(`/interactions/${id}`, { status });
            // update local state or refetch
            if (status === 'READING') {
                const pdfUrl = book.files?.pdf || "https://pdfobject.com/pdf/sample.pdf"; // Fallback for demo
                window.open(pdfUrl, '_blank');
            } else {
                alert('Status updated!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoinGroup = async (group) => {
        if (!user) return navigate('/login');
        if (group.joinCode) {
            try {
                await api.post('/groups/join', { inviteCode: group.joinCode });
                navigate(`/groups/${group._id}`);
            } catch (err) {
                alert('Failed to join group: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (!book) return <div className="text-center p-10">Book not found</div>;

    return (
        <div className="relative min-h-screen w-full text-gray-200">
            {/* 1. Page Atmosphere - Radial Ambient Light */}
            <div className="fixed inset-0 -z-10 bg-[#0b0b0c]">
                <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_35%_30%,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-8">
                    {/* Left Column: Book Cover & Actions */}
                    <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-10">
                        {/* 2. Book Cover - Physical Object */}
                        <div className="relative mx-auto md:mx-0 w-full max-w-[280px] perspective-container">
                            <BookCover
                                src={book.coverUrl || 'https://placehold.co/300x450?text=No+Cover'}
                                alt={book.title}
                                className="w-full aspect-[2/3] shadow-[0_8px_18px_rgba(0,0,0,0.45),0_30px_70px_rgba(0,0,0,0.65)] [&>div]:after:content-[''] [&>div]:after:absolute [&>div]:after:-right-[6px] [&>div]:after:top-[6px] [&>div]:after:bottom-[6px] [&>div]:after:w-[6px] [&>div]:after:bg-gradient-to-b [&>div]:after:from-[#e8e1c9] [&>div]:after:via-[#cfc6a4] [&>div]:after:to-[#e8e1c9] [&>div]:after:rounded-r-[4px] [&>div]:after:opacity-60"
                                imgClassName="object-cover rounded-sm"
                                onError={(e) => { e.target.src = "https://placehold.co/300x450?text=No+Cover" }}
                            />
                        </div>

                        {/* 5. Primary Actions - Ritual Interaction */}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => handleStatusUpdate('READING')}
                                className="w-full py-3.5 rounded bg-gradient-to-b from-[#a8793a] to-[#8f642f] text-[#f5e6c8] font-medium shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_12px_26px_rgba(0,0,0,0.6),0_0_18px_rgba(212,175,55,0.25)] active:translate-y-[1px] flex items-center justify-center gap-2"
                            >
                                <BookOpen size={18} /> Start Reading
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('WANT_TO_READ')}
                                className="w-full py-3 rounded border border-[#d4af37]/35 bg-transparent text-gray-400 font-medium transition-all duration-200 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/70 hover:text-[#f5e6c8] flex items-center justify-center gap-2"
                            >
                                <Clock size={18} /> Want to Read
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Metadata, Synopsis, Groups */}
                    <div className="md:col-span-8 lg:col-span-7 lg:col-start-6 pt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
                        {/* 3. Title Hierarchy */}
                        <div>
                            <h1
                                className="text-4xl md:text-5xl font-heading font-medium tracking-[0.02em] text-[#f5e6c8] leading-tight mb-3 drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]"
                            >
                                {book.title}
                            </h1>
                            <p className="text-sm tracking-[0.08em] uppercase text-white/55 font-medium">
                                {book.author}
                            </p>

                            {/* Separator Line */}
                            <div className="my-6 h-px w-[60px] bg-gradient-to-r from-[#d4af37] to-transparent"></div>

                            <div className="flex items-center gap-6 text-sm text-white/50">
                                <span className="flex items-center gap-1.5">
                                    <Star className="text-[#d4af37]" size={14} fill="currentColor" />
                                    <span className="text-white/70">{book.stats?.averageRating?.toFixed(1) || '0.0'}</span>
                                    <span>({book.stats?.ratingsCount || 0} ratings)</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <BookOpen size={14} />
                                    <span>{book.stats?.readsCount || 0} reads</span>
                                </span>
                                <Link to={`/genres/${book.genre}`} className="hover:text-[#d4af37] transition-colors uppercase text-xs tracking-wider">
                                    {book.genre}
                                </Link>
                            </div>
                        </div>

                        {/* 4. Synopsis - Reading Comfort */}
                        <div>
                            <span className="block mb-4 text-xs tracking-[0.25em] text-[#d4af37]/70 font-medium uppercase">
                                Synopsis
                            </span>
                            <p className="font-body text-base md:text-lg leading-[1.9] text-white/82 max-w-[65ch]">
                                {book.description || 'No description available for this book.'}
                            </p>
                        </div>

                        {/* 6. Reading Groups Card - Social Object */}
                        <div className="mt-12 p-6 rounded-lg bg-gradient-to-b from-[#141414] to-[#101010] border border-[#d4af37]/18 shadow-[0_18px_45px_rgba(0,0,0,0.55)] group transition-transform duration-200 hover:-translate-y-0.5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-heading text-[#e8e1c9] mb-1">Reading Circles</h3>
                                    <p className="text-sm text-gray-500">Discuss this book with a community.</p>
                                </div>
                                <Link
                                    to="/groups/create"
                                    state={{ bookId: book._id }}
                                    className="text-xs font-bold tracking-[0.12em] uppercase text-[#d4af37]/80 hover:text-[#d4af37] transition-all hover:underline decoration-[#d4af37]/30 underline-offset-4"
                                >
                                    Create Group
                                </Link>
                            </div>

                            {/* Groups List */}
                            <div className="space-y-3">
                                {groups.length > 0 ? (
                                    groups.map(group => (
                                        <div key={group._id} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-200">{group.name}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><User size={10} /> {group.members?.length || 0} members</span>
                                                    {group.isMember && <span className="text-emerald-500 font-medium">Joined</span>}
                                                </div>
                                            </div>
                                            {group.isMember ? (
                                                <Link to={`/groups/${group._id}`} className="px-3 py-1.5 text-xs font-medium bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded hover:bg-[#d4af37]/20 transition-colors">
                                                    Open
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleJoinGroup(group)}
                                                    className="px-3 py-1.5 text-xs font-medium bg-white/5 text-gray-300 border border-white/10 rounded hover:bg-white/10 transition-colors"
                                                >
                                                    Join
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-gray-600 italic">No active circles for this book yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
