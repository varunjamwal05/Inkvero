const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a group name'],
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 500
    },
    currentBook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    totalPages: {
        type: Number // Override for book's total pages
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    joinCode: {
        type: String,
        unique: true,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
