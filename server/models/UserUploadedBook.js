const mongoose = require('mongoose');

const userUploadedBookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    author: {
        type: String,
        required: [true, 'Please add an author']
    },
    description: {
        type: String
    },
    genre: {
        type: String, // Plain text for flexibility
        default: 'Uncategorized'
    },
    coverImage: {
        type: String, // Path to local file
        default: 'default-cover.jpg'
    },
    fileUrl: {
        type: String, // Path to local PDF
        required: [true, 'Please upload a book file']
    },
    visibility: {
        type: String,
        enum: ['private', 'group', 'public'],
        default: 'private'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for search
userUploadedBookSchema.index({ title: 'text', author: 'text' });

// Virtual for cover URL
userUploadedBookSchema.virtual('coverUrl').get(function () {
    if (this.coverImage && this.coverImage !== 'default-cover.jpg') {
        if (this.coverImage.startsWith('http')) {
            return this.coverImage;
        }
        return `${process.env.BASE_URL || 'http://localhost:5000'}/${this.coverImage.replace(/^\/+/, '')}`;
    }
    return null;
});

// Ensure virtuals are included in JSON
userUploadedBookSchema.set('toJSON', { virtuals: true });
userUploadedBookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('UserUploadedBook', userUploadedBookSchema);
