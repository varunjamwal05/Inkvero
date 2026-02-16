import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';

const CreateGroup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [search, setSearch] = useState('');
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [loading, setLoading] = useState(false);

    // Pre-select book if passed from navigation state
    useEffect(() => {
        if (location.state?.bookId) {
            const fetchBook = async () => {
                try {
                    const { data } = await api.get(`/books/${location.state.bookId}`);
                    setSelectedBook(data.data);
                } catch (err) {
                    console.error("Failed to load pre-selected book", err);
                }
            };
            fetchBook();
        }
    }, [location.state]);

    // Search books to select for the group
    useEffect(() => {
        const searchBooks = async () => {
            if (!search) {
                setBooks([]);
                return;
            }
            try {
                const { data } = await api.get('/books', { params: { query: search, limit: 5 } });
                setBooks(data.data);
            } catch (err) {
                console.error(err);
            }
        };

        const timeoutId = setTimeout(() => {
            if (search) searchBooks();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBook) return alert('Please select a book');

        setLoading(true);
        try {
            const { data } = await api.post('/groups', {
                name,
                description,
                bookId: selectedBook._id,
                isPrivate
            });
            navigate(`/groups/${data.data._id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-heading mb-8 text-center text-highlight">Start a Book Club</h1>

            <div className="card border border-white/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-secondary/80">Group Name</label>
                        <input
                            type="text"
                            className="input-field bg-background/50 border border-white/10"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. The Midnight Readers"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-secondary/80">Description</label>
                        <textarea
                            className="input-field bg-background/50 border border-white/10 h-24 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this group about?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-secondary/80">Select Current Read</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="input-field bg-background/50 border border-white/10 pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for a book..."
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        </div>

                        {/* Search Results Dropdown */}
                        {books.length > 0 && !selectedBook && (
                            <div className="mt-2 bg-input rounded-md border border-white/10 max-h-60 overflow-y-auto">
                                {books.map(book => (
                                    <div
                                        key={book._id}
                                        className="p-3 hover:bg-white/5 cursor-pointer flex gap-3 items-center"
                                        onClick={() => { setSelectedBook(book); setSearch(''); setBooks([]); }}
                                    >
                                        <img src={book.coverUrl || 'https://placehold.co/50x75?text=Cover'} alt={book.title} className="w-10 h-14 object-cover" />
                                        <div>
                                            <p className="font-medium text-sm">{book.title}</p>
                                            <p className="text-xs text-gray-400">{book.author}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedBook && (
                            <div className="mt-4 flex gap-4 p-4 bg-white/5 rounded-lg border border-highlight/30 items-center justify-between">
                                <div className="flex gap-4 items-center">
                                    <img src={selectedBook.coverUrl || 'https://placehold.co/50x75?text=Cover'} alt={selectedBook.title} className="w-12 h-18 object-cover shadow" />
                                    <div>
                                        <h4 className="font-heading">{selectedBook.title}</h4>
                                        <p className="text-sm text-gray-400">{selectedBook.author}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setSelectedBook(null)} className="text-xs text-red-400 hover:text-red-300">Change</button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                        <div>
                            <label className="block text-sm font-medium text-gray-200">Private Group</label>
                            <p className="text-xs text-gray-500 mt-1">Private groups are hidden from the book page and require an invite code to join.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;
