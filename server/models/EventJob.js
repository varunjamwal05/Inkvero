const mongoose = require('mongoose');

const eventJobSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['UPDATE_BOOK_STATS', 'TRENDING_CALC', 'CLEANUP']
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'FAILED', 'COMPLETED'],
        default: 'PENDING'
    },
    errorMessage: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    processedAt: Date
});

const EventJob = mongoose.model('EventJob', eventJobSchema);

module.exports = EventJob;
