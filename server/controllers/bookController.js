const cloudinary = require('cloudinary').v2;
const Book = require('../models/Book');
const searchService = require('../services/SearchService');
const trendingService = require('../services/TrendingService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get upload signature
// @route   GET /api/v1/books/upload-signature
// @access  Private
exports.getUploadSignature = catchAsync(async (req, res, next) => {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: 'inkvero/books'
    }, process.env.CLOUDINARY_API_SECRET);

    res.status(200).json({
        status: 'success',
        data: {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        }
    });
});

// @desc    Create a book
// @route   POST /api/v1/books
// @access  Private
exports.createBook = catchAsync(async (req, res, next) => {
    req.body.uploadedBy = req.user.id;

    // Default cover logic
    if (!req.body.files?.cover || req.body.files.cover === 'no-photo.jpg' || req.body.files.cover.trim() === '') {
        const genreImages = {
            'Romance': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80',
            'Fantasy': 'https://images.unsplash.com/photo-1528209392022-4e8c2f7b9c3a?auto=format&fit=crop&w=300&q=80',
            'Horror': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80',
            'Programming': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80',
            'Business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80',
            'Self-Help': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=300&q=80',
            // Keep others or fallback? User only provided these specific 6.
            // I will keep the others I had but commented out or just rely on generic fallback for them?
            // User instruction: "book.coverImage = defaultCovers[genre.name] || genericCover;"
            // I'll keep my other mappings if they don't conflict, to be safe, but prioritize theirs.
            'Sci-Fi': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80',
            'Non-Fiction': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80',
            'Mystery': 'https://images.unsplash.com/photo-1585044433842-51000b0c96c4?auto=format&fit=crop&w=300&q=80',
            'Classic': 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=300&q=80'
        };

        // Ensure files object exists
        if (!req.body.files) req.body.files = {};

        // Map genre to image or use a generic fallback
        req.body.files.cover = genreImages[req.body.genre] || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80';
    }

    const book = await Book.create(req.body);

    res.status(201).json({
        status: 'success',
        data: book
    });
});

// @desc    Get all books
// @route   GET /api/v1/books
// @access  Public
exports.getBooks = catchAsync(async (req, res, next) => {
    const { query, genre, page = 1, limit = 20 } = req.query;

    // Use SearchService - it now returns paginated object
    const result = await searchService.searchBooks(
        query,
        { genre },
        parseInt(page),
        parseInt(limit)
    );

    res.status(200).json({
        status: 'success',
        results: result.data.length,
        total: result.total,
        page: result.page,
        data: result.data
    });
});

// @desc    Get books by genre
// @route   GET /api/v1/books/genre/:genreId
// @access  Public
exports.getBooksByGenre = async (req, res, next) => {
    try {
        console.log("Incoming genreId:", req.params.genreId);

        const genre = req.params.genreId;

        // NOTE: Database check confirmed 'genre' is a String Enum, not an ObjectId.
        // Therefore explicit ObjectId casting is NOT performed to prevent CastErrors.
        // Using Regex for case-insensitive matching.

        const books = await Book.find({
            genre: { $regex: new RegExp(`^${genre}$`, 'i') }
        }).sort({ createdAt: -1 });

        console.log(`Found ${books.length} books for genre: ${genre}`);

        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (err) {
        console.error("GENRE FILTER ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// @desc    Get trending books
// @route   GET /api/v1/books/trending
// @access  Public
exports.getTrendingBooks = catchAsync(async (req, res, next) => {
    const books = await trendingService.getTrendingBooks();

    res.status(200).json({
        status: 'success',
        results: books.length,
        data: books
    });
});

// @desc    Get single book
// @route   GET /api/v1/books/:id
// @access  Public
exports.getBook = catchAsync(async (req, res, next) => {
    let book = await Book.findById(req.params.id)
        .populate('uploadedBy', 'username avatar');

    if (!book) {
        // Try finding in UserUploadedBook
        const UserUploadedBook = require('../models/UserUploadedBook');
        const userUpload = await UserUploadedBook.findById(req.params.id)
            .populate('user', 'username avatar');

        if (userUpload) {
            // Normalize to match Book interface
            book = {
                ...userUpload.toObject(),
                uploadedBy: userUpload.user,
                coverUrl: userUpload.coverImage === 'default-cover.jpg' ? 'https://placehold.co/300x450?text=No+Cover' : userUpload.coverImage,
                files: {
                    pdf: userUpload.fileUrl
                },
                isUserUpload: true
            };
        }
    }

    if (!book) {
        return next(new AppError('No book found with that ID', 404, 'RESOURCE_NOT_FOUND'));
    }

    res.status(200).json({
        status: 'success',
        data: book
    });
});

// @desc    Update book
// @route   PUT /api/v1/books/:id
// @access  Private (Owner/Admin)
exports.updateBook = catchAsync(async (req, res, next) => {
    let book = await Book.findById(req.params.id);

    if (!book) {
        return next(new AppError('No book found with that ID', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Check ownership
    if (book.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this book', 403, 'AUTH_FORBIDDEN'));
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: book
    });
});

// @desc    Delete book
// @route   DELETE /api/v1/books/:id
// @access  Private (Owner/Admin)
exports.deleteBook = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        return next(new AppError('No book found with that ID', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Check ownership
    if (book.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this book', 403, 'AUTH_FORBIDDEN'));
    }

    await book.deleteOne();

    res.status(200).json({
        status: 'success',
        data: null
    });
});
