import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import BookCover from '../components/BookCover';
import { useBookTransition } from '../context/BookTransitionContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const Explore = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { startTransition } = useBookTransition();
    const { user } = useAuth();

    const handleBookInteraction = async (bookId, action) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Are you sure you want to {action} this book?</p>
                <div className="flex gap-2 justify-end mt-1">
                    <button
                        className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded text-xs transition-colors uppercase tracking-wider"
                        onClick={() => {
                            toast.dismiss(t.id);
                            performBookInteraction(bookId, action);
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
        ), { duration: 5000, icon: '📚' });
    };

    const performBookInteraction = async (bookId, action) => {
        try {
            if (action === 'delete') {
                await api.delete(`/admin/books/${bookId}`);
                setBooks(books.filter(b => b._id !== bookId));
                toast.success('Book deleted successfully!');
            } else if (action === 'hide') {
                const { data } = await api.patch(`/admin/books/${bookId}/hide`);
                setBooks(books.map(b => b._id === bookId ? { ...b, isHidden: data.data.isHidden } : b));
                toast.success(`Book ${data.data.isHidden ? 'hidden' : 'unhidden'} successfully!`);
            } else if (action === 'verify') {
                const { data } = await api.patch(`/admin/books/${bookId}/verify`);
                setBooks(books.map(b => b._id === bookId ? { ...b, isVerified: data.data.isVerified } : b));
                toast.success(`Book ${data.data.isVerified ? 'verified' : 'unverified'} successfully!`);
            } else if (action === 'read') {
                // Open PDF logic would go here, currently placeholder based on instruction context
                // For now, assuming standard read action behavior
                toast.success("Opening book...");
            }
        } catch (err) {
            console.error(err);
            toast.error(`Failed to ${action} book`);
        }
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15,
                query: search,
                genre: genre
            };

            const { data } = await api.get('/books', { params });
            setBooks(data.data);
            setTotalPages(Math.ceil(data.total / 15));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
        window.scrollTo(0, 0);
    }, [page, genre]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchBooks();
    };

    const handleGenreChange = (e) => {
        setGenre(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="w-full px-6 lg:px-10 relative pb-10">
            {/* Subtle Radial Lighting Background */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,215,120,0.06)_0%,transparent_60%)] -z-10"></div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 relative z-10">
                <div>
                    <h1 className="text-3xl font-heading text-secondary">Explore Books</h1>
                    <p className="text-sm text-zinc-500 mt-1">Discover your next great read.</p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:w-64">
                        <input
                            type="text"
                            placeholder="Search title, author..."
                            className="w-full bg-white/5 border border-white/10 text-secondary px-4 py-2 pl-10 rounded-lg focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/40 transition-all duration-300 placeholder:text-gray-600"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-600" size={18} />
                    </div>
                    <div className="relative">
                        <style>
                            {`
                                select#genre-select option {
                                    background-color: #0f0f10;
                                    color: #d4d4d8;
                                }
                                select#genre-select option:hover {
                                    background-color: rgba(255,255,255,0.06);
                                    color: #ffffff;
                                }
                                select#genre-select option:checked {
                                    background-color: rgba(251,191,36,0.18) !important;
                                    color: #facc15 !important;
                                }
                                /* Scrollbar styles (if supported by browser for select dropdown) */
                                select#genre-select::-webkit-scrollbar { width: 6px; }
                                select#genre-select::-webkit-scrollbar-track { background: transparent; }
                                select#genre-select::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 6px; }
                            `}
                        </style>
                        <select
                            id="genre-select"
                            className="bg-zinc-900/80 border border-white/[0.08] text-zinc-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-colors duration-200 text-sm cursor-pointer hover:bg-zinc-800/80 active:bg-zinc-800/80"
                            value={genre}
                            onChange={handleGenreChange}
                        >
                            <option value="">All Genres</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Romance">Romance</option>
                            <option value="Horror">Horror</option>
                            <option value="Self-Help">Self-Help</option>
                            <option value="Biography">Biography</option>
                            <option value="History">History</option>
                            <option value="Poetry">Poetry</option>
                            <option value="Classic">Classic</option>
                            <option value="Philosophy">Philosophy</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary">Search</button>
                </form>
            </div>

            {loading ? (
                <div className="text-center p-10 text-gray-500">Loading Books...</div>
            ) : books.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400">No books found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-6 gap-y-12 relative z-10 mb-12">
                        {books.map((book) => (
                            <div key={book._id} className="relative group">
                                <Link
                                    to={`/books/${book._id}`}
                                    className="block h-full transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:bg-white/[0.03] bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-xl p-3 cursor-pointer active:scale-[0.98]"
                                    onClick={(e) => {
                                        const img = e.currentTarget.querySelector('img');
                                        if (img) {
                                            const rect = img.getBoundingClientRect();
                                            startTransition({
                                                rect: {
                                                    top: rect.top,
                                                    left: rect.left,
                                                    width: rect.width,
                                                    height: rect.height
                                                },
                                                imageSrc: book.coverUrl || 'https://placehold.co/300x450?text=No+Cover'
                                            });
                                        }
                                    }}
                                >
                                    <div className="aspect-[2/3] w-full rounded-lg bg-white/[0.05] overflow-hidden relative mb-3">
                                        <div className="absolute inset-0 bg-white/[0.05] animate-pulse" />
                                        <BookCover
                                            src={book.coverUrl || 'https://placehold.co/300x450?text=No+Cover'}
                                            alt={book.title}
                                            loading="lazy"
                                            onLoad={(e) => e.target.style.opacity = 1}
                                            className="h-full w-full"
                                            imgClassName="opacity-0 transition-opacity duration-500"
                                        />
                                        {/* Hover Action Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/10">
                                                View Details
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="font-heading text-base text-gray-200 leading-snug mb-1 line-clamp-2 h-10 tracking-[0.01em] group-hover:text-white transition-colors">{book.title}</h3>
                                    <p className="text-sm text-zinc-400 mb-2 truncate">{book.author}</p>
                                    <div className="flex justify-between items-center text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">
                                        <span>{book.genre}</span>
                                    </div>
                                </Link>

                                {/* Admin Badge/Overlay */}
                                {book.isHidden && (
                                    <div className="absolute top-2 left-2 bg-red-500/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none z-20">
                                        HIDDEN
                                    </div>
                                )}

                                {/* Admin Controls */}
                                {user?.role === 'admin' && (
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleBookInteraction('delete', book._id);
                                            }}
                                            className="bg-red-900/80 hover:bg-red-800 text-white p-1.5 rounded-md backdrop-blur-sm transition-colors border border-red-500/30"
                                            title="Delete Book"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleBookInteraction('hide', book._id);
                                            }}
                                            className={`${book.isHidden ? 'bg-amber-600/80 hover:bg-amber-500' : 'bg-zinc-800/80 hover:bg-zinc-700'} text-white p-1.5 rounded-md backdrop-blur-sm transition-colors border border-white/10`}
                                            title={book.isHidden ? "Unhide" : "Hide"}
                                        >
                                            {book.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleBookInteraction('verify', book._id);
                                            }}
                                            className={`${book.isVerified ? 'bg-green-600/80 hover:bg-green-500' : 'bg-zinc-800/80 hover:bg-zinc-700'} text-white p-1.5 rounded-md backdrop-blur-sm transition-colors border border-white/10`}
                                            title={book.isVerified ? "Unverify" : "Verify"}
                                        >
                                            {book.isVerified ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-zinc-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${page === pageNum
                                        ? 'bg-amber-500 text-black font-semibold'
                                        : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-zinc-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Explore;
