const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: { // Denormalized for query convenience/speed
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastDiscussedAt: {
        type: Date
    }
});

// Compound index for member uniqueness in group
groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

const GroupMember = mongoose.model('GroupMember', groupMemberSchema);

module.exports = GroupMember;
