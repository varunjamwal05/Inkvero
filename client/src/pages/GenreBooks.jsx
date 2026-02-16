
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { BookOpen } from 'lucide-react';
import BookCover from '../components/BookCover';
import { useBookTransition } from '../context/BookTransitionContext';

const GenreBooks = () => {
    const { genreId } = useParams();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { startTransition } = useBookTransition();

    useEffect(() => {
        const fetchBooksByGenre = async () => {
            setLoading(true);
            try {
                // Use the new endpoint we verified
                // Note: genreId here is the string name like "Fantasy"
                const { data } = await api.get(`/books/genre/${genreId}`);
                // Verify data structure based on controller response: { success: true, count: N, data: [] }
                setBooks(data.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching genre books:", err);
                setError("Failed to load books for this genre.");
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        if (genreId) {
            fetchBooksByGenre();
        }
    }, [genreId]);

    const handleImageError = (e) => {
        e.target.src = "https://placehold.co/300x450?text=No+Cover";
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <Link to="/explore" className="text-sm text-gray-500 hover:text-white mb-4 block">&larr; Back to Explore</Link>
                <h1 className="text-3xl font-heading text-secondary">
                    <span className="text-highlight">{genreId}</span> Books
                </h1>
                <p className="text-gray-400 mt-2">Browse our collection of {genreId} titles.</p>
            </div>

            {loading ? (
                <div className="text-center p-10">Loading...</div>
            ) : error ? (
                <div className="text-center p-10 text-red-400">{error}</div>
            ) : books.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-lg">
                    <p className="text-gray-300">No books found in this genre yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <Link
                            to={`/books/${book._id}`}
                            key={book._id}
                            className="card group hover:-translate-y-1 transition-transform duration-300"
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
                            <div className="aspect-[2/3] overflow-hidden rounded mb-4 bg-gray-800 relative">
                                <BookCover
                                    src={book.coverUrl || "https://placehold.co/300x450?text=No+Cover"}
                                    alt={book.title}
                                    className="w-full h-full"
                                    imgClassName="object-cover"
                                    onError={handleImageError}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <BookOpen className="text-white" size={32} />
                                </div>
                            </div>
                            <h3 className="font-heading text-lg leading-tight mb-1 truncate">{book.title}</h3>
                            <p className="text-sm text-accent mb-2">{book.author}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{book.genre}</span>
                                <span>{book.stats?.avgRating?.toFixed(1) || '-'} ★</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GenreBooks;
