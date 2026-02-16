import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Upload, Trash2, Eye, Lock, Globe, Users, BookOpen, AlertCircle } from 'lucide-react';

const MyUploadsPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        genre: '',
        visibility: 'private'
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const fetchMyBooks = async () => {
        try {
            const { data } = await api.get('/my-books');
            setBooks(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'pdf') setPdfFile(file);
        if (type === 'cover') setCoverFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
            setError('Please upload a PDF file');
            return;
        }

        setUploading(true);
        setError('');

        const data = new FormData();
        data.append('title', formData.title);
        data.append('author', formData.author);
        data.append('description', formData.description);
        data.append('genre', formData.genre);
        data.append('visibility', formData.visibility);
        data.append('pdf', pdfFile);
        if (coverFile) data.append('cover', coverFile);

        try {
            await api.post('/my-books/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset form
            setFormData({
                title: '', author: '', description: '', genre: '', visibility: 'private'
            });
            setPdfFile(null);
            setCoverFile(null);
            // Refetch
            fetchMyBooks();
            alert('Book uploaded successfully!');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            await api.delete(`/my-books/${id}`);
            setBooks(books.filter(b => b._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete book');
        }
    };

    const handleRead = (book) => {
        window.open(book.fileUrl, '_blank');
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-light text-white tracking-tight mb-1">My Library</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Manage your personal collection</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Upload Form Panel */}
                <div className="lg:col-span-4 sticky top-8">
                    <div className="bg-[#161616] border border-white/5 rounded-xl p-6 shadow-2xl shadow-black/20">
                        <h2 className="text-xs font-medium text-white mb-6 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
                            <Upload size={14} className="text-amber-500" /> Upload New Book
                        </h2>

                        {error && (
                            <div className="bg-red-500/5 border border-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-xs flex items-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-gray-300 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-gray-800"
                                    placeholder="Enter book title"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium">Author</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-gray-300 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-gray-800"
                                    placeholder="Author name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium">Genre</label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-gray-300 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-gray-800"
                                        placeholder="Genre"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium">Visibility</label>
                                    <select
                                        value={formData.visibility}
                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-gray-300 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all appearance-none cursor-pointer hover:bg-[#0f0f0f]"
                                    >
                                        <option value="private">Private</option>
                                        <option value="group">Group Only</option>
                                        <option value="public">Public</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-gray-300 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all placeholder:text-gray-800 h-20 resize-none"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div className="pt-2 space-y-4">
                                <div className="relative group/file">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">Cover Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'cover')}
                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:uppercase file:tracking-widest file:bg-white/5 file:text-gray-300 hover:file:bg-white/10 file:transition-colors cursor-pointer"
                                    />
                                </div>
                                <div className="relative group/file">
                                    <label className="block text-[10px] uppercase tracking-widest text-amber-500/80 font-medium mb-2">PDF Document *</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        required
                                        onChange={(e) => handleFileChange(e, 'pdf')}
                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:uppercase file:tracking-widest file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 file:transition-colors cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-lg text-xs font-medium tracking-wide uppercase flex justify-center items-center gap-2 transition-all shadow-lg shadow-white/5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : <><Upload size={14} /> Upload Book</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Books List Panel */}
                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-gray-600 gap-4">
                            <div className="w-6 h-6 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin"></div>
                            <span className="text-xs uppercase tracking-widest">Loading Library...</span>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="bg-[#161616] border border-white/5 rounded-xl border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <BookOpen size={24} className="text-gray-600" />
                            </div>
                            <h3 className="text-lg font-light text-white mb-2">Your library is empty</h3>
                            <p className="text-gray-500 text-sm font-light max-w-xs mx-auto">Upload a PDF book using the panel on the left to start building your personal collection.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {books.map((book) => (
                                <div key={book._id} className="group flex flex-col bg-[#161616] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1">
                                    <div className="relative h-48 bg-[#0a0a0a] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent z-10 opacity-60"></div>
                                        <img
                                            src={book.coverImage}
                                            alt={book.title}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                            onError={(e) => e.target.src = 'https://placehold.co/300x450?text=No+Cover'}
                                        />
                                        <div className="absolute top-3 right-3 z-20">
                                            <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-widest font-medium border ${book.visibility === 'private' ? 'bg-black/40 border-white/10 text-gray-400' :
                                                    book.visibility === 'group' ? 'bg-blue-900/20 border-blue-500/20 text-blue-400' :
                                                        'bg-green-900/20 border-green-500/20 text-green-400'
                                                }`}>
                                                {book.visibility}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-white mb-1 line-clamp-1 group-hover:text-amber-500 transition-colors">{book.title}</h3>
                                            <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[9px] uppercase tracking-wider text-gray-600 bg-white/5 px-2 py-0.5 rounded">{book.genre || 'General'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => handleRead(book)}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white py-2 rounded-lg text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all border border-white/5"
                                            >
                                                <BookOpen size={12} /> Read
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book._id)}
                                                className="px-3 py-2 rounded-lg bg-red-500/5 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyUploadsPage;
