const User = require('../models/User');
const UserBookState = require('../models/UserBookState');
const catchAsync = require('../utils/catchAsync');

// @desc    Get current user profile (Isolated)
// @route   GET /api/v1/profile/me
// @access  Private
exports.getProfile = catchAsync(async (req, res, next) => {
    const userPromise = User.findById(req.user.id).select('_id username email avatar bio createdAt');

    // Fetch stats in parallel
    const currentlyReadingPromise = UserBookState.findOne({
        user: req.user.id,
        status: 'READING'
    }).populate({
        path: 'book',
        select: 'title authors coverImage'
    });

    const completedCountPromise = UserBookState.countDocuments({
        user: req.user.id,
        status: 'COMPLETED'
    });

    const planCountPromise = UserBookState.countDocuments({
        user: req.user.id,
        status: 'WANT_TO_READ'
    });

    const [user, currentlyReading, completedCount, planCount] = await Promise.all([
        userPromise,
        currentlyReadingPromise,
        completedCountPromise,
        planCountPromise
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            user,
            stats: {
                currentlyReading: currentlyReading || null,
                completedCount,
                planCount
            }
        }
    });
});

// @desc    Update current user profile (Isolated)
// @route   PATCH /api/v1/profile/me
// @access  Private
exports.updateProfile = catchAsync(async (req, res, next) => {
    // 1. Filter out unwanted field names that are not allowed to be updated
    const allowedFields = ['bio', 'avatar'];
    const filteredBody = {};

    Object.keys(req.body).forEach(el => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // 2. Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }).select('_id username email avatar bio createdAt');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});
