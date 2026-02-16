const UserBookState = require('../models/UserBookState');
const EventQueue = require('../utils/EventQueue');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Update interaction (Status, Progress, Rating)
// @route   POST /api/v1/interactions/:bookId
// @access  Private
exports.interactWithBook = catchAsync(async (req, res, next) => {
    const { status, progress, rating, review, totalPages } = req.body;
    const bookId = req.params.bookId;
    const userId = req.user.id;

    let state = await UserBookState.findOne({ user: userId, book: bookId });

    if (!state) {
        state = new UserBookState({ user: userId, book: bookId });
    }

    // Update fields if provided
    if (status) state.status = status;
    if (progress !== undefined) {
        state.progress = progress;
        if (progress > state.maxProgress) state.maxProgress = progress;
    }
    if (rating) state.rating = rating;
    if (review) state.review = review;
    if (totalPages) state.personalTotalPages = totalPages;

    state.lastInteractedAt = Date.now();
    await state.save();

    // Queue background jobs
    if (rating) {
        await EventQueue.add('UPDATE_BOOK_STATS', {
            bookId,
            rating,
            isNewRating: true // Simplification, ideally verify if rating changed
        });

        await EventQueue.add('ACTIVITY_LOG', {
            user: userId,
            target: bookId,
            targetModel: 'Book',
            action: 'RATE_5' // Only log significant ratings or just RATE? Plan says specific actions
        });
    }

    if (status === 'READING') {
        await EventQueue.add('ACTIVITY_LOG', {
            user: userId,
            target: bookId,
            targetModel: 'Book',
            action: 'START_READ'
        });
    }

    if (status === 'COMPLETED') {
        await EventQueue.add('ACTIVITY_LOG', {
            user: userId,
            target: bookId,
            targetModel: 'Book',
            action: 'FINISH_READ'
        });
    }

    res.status(200).json({
        status: 'success',
        data: state
    });
});

// @desc    Get my library
// @route   GET /api/v1/interactions/my-library
// @access  Private
exports.getMyLibrary = catchAsync(async (req, res, next) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;

    const library = await UserBookState.find(query)
        .populate('book', 'title author files')
        .sort('-lastInteractedAt')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.status(200).json({
        status: 'success',
        results: library.length,
        data: library
    });
});

// @desc    Remove interaction (Remove from library)
// @route   DELETE /api/v1/interactions/:bookId
// @access  Private
exports.removeInteraction = catchAsync(async (req, res, next) => {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const state = await UserBookState.findOneAndDelete({ user: userId, book: bookId });

    if (!state) {
        return next(new AppError('Book not found in your library', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
