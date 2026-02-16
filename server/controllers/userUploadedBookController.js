const UserUploadedBook = require('../models/UserUploadedBook');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');

// @desc    Upload a new book
// @route   POST /api/v1/my-books/upload
// @access  Private
exports.uploadBook = catchAsync(async (req, res, next) => {
    // req.files is set by multer
    // console.log(req.files);

    if (!req.files || !req.files.pdf) {
        return next(new AppError('Please upload a PDF file.', 400));
    }

    const { title, author, description, genre, visibility } = req.body;

    // Construct paths relative to server root for storage in DB
    const pdfPath = `/uploads/books/${req.files.pdf[0].filename}`;

    let coverPath = 'https://placehold.co/300x450?text=No+Cover';
    if (req.files.cover) {
        coverPath = `/uploads/covers/${req.files.cover[0].filename}`;
    }

    const newBook = await UserUploadedBook.create({
        user: req.user.id,
        title,
        author,
        description,
        genre,
        visibility,
        fileUrl: pdfPath,
        coverImage: coverPath
    });

    res.status(201).json({
        status: 'success',
        data: newBook
    });
});

// @desc    Get my uploaded books
// @route   GET /api/v1/my-books
// @access  Private
exports.getMyBooks = catchAsync(async (req, res, next) => {
    const books = await UserUploadedBook.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        count: books.length,
        data: books
    });
});

// @desc    Delete an uploaded book
// @route   DELETE /api/v1/my-books/:id
// @access  Private
exports.deleteBook = catchAsync(async (req, res, next) => {
    const book = await UserUploadedBook.findById(req.params.id);

    if (!book) {
        return next(new AppError('Book not found', 404));
    }

    // Ensure ownership
    if (book.user.toString() !== req.user.id) {
        return next(new AppError('Not authorized to delete this book', 403));
    }

    // Delete files from filesystem
    // Helper to delete file
    const deleteFile = (relativePath) => {
        if (relativePath && relativePath.startsWith('/uploads')) {
            const filePath = path.join(__dirname, '..', relativePath);
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Failed to delete file: ${filePath}`, err);
            });
        }
    };

    deleteFile(book.fileUrl);
    deleteFile(book.coverImage);

    await book.deleteOne(); // or findByIdAndDelete

    res.status(204).json({
        status: 'success',
        data: null
    });
});
