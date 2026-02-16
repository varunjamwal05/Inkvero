const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a book title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    author: {
        type: String,
        required: [true, 'Please add an author'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    genre: {
        type: String,
        required: [true, 'Please select a genre'],
        enum: [
            'Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Sci-Fi',
            'Biography', 'History', 'Romance', 'Horror', 'Self-Help',
            'Philosophy', 'Poetry', 'Classic'
        ],
        index: true
    },
    files: {
        cover: {
            type: String,
            default: 'no-photo.jpg'
        },
        pdf: {
            type: String,
            // required: true // Can be optional if just metadata
        },
        totalPages: {
            type: Number,
            default: 100
        }
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stats: {
        avgRating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        readCount: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Text index for search
bookSchema.index({ title: 'text', author: 'text' });

// Compound index for "Top rated in Genre"
bookSchema.index({ genre: 1, 'stats.avgRating': -1 });

bookSchema.add({
    isHidden: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

// Virtual for cover URL to simplify frontend access
bookSchema.virtual('coverUrl').get(function () {
    if (this.files && this.files.cover) {
        if (this.files.cover.startsWith('http')) {
            return this.files.cover;
        }
        return `${process.env.BASE_URL || 'http://localhost:5000'}${this.files.cover}`;
    }
    return 'https://placehold.co/300x450?text=No+Cover';
});

// Ensure virtuals are included in JSON
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
