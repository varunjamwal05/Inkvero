const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        required: true,
        enum: ['Book', 'Group']
    },
    action: {
        type: String,
        required: true,
        enum: ['START_READ', 'FINISH_READ', 'RATE_5', 'JOIN_GROUP', 'CREATE_REVIEW', 'UPDATE_PROGRESS']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for trending calculation
activityLogSchema.index({ target: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
