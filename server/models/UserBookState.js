const mongoose = require('mongoose');

const userBookStateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    status: {
        type: String,
        enum: ['WANT_TO_READ', 'READING', 'COMPLETED', 'DROPPED'],
        default: 'WANT_TO_READ'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    maxProgress: {
        type: Number,
        default: 0
    },
    personalTotalPages: {
        type: Number
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String
    },
    lastInteractedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate entries for same book and user
userBookStateSchema.index({ user: 1, book: 1 }, { unique: true });

const UserBookState = mongoose.model('UserBookState', userBookStateSchema);

module.exports = UserBookState;
