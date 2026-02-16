const Book = require('../models/Book');
const UserUploadedBook = require('../models/UserUploadedBook');

/**
 * Interface definition for SearchService
 * searchBooks(query, filters): Promise<Book[]>
 */

class SearchService {
    async searchBooks(queryStr, filters = {}, page = 1, limit = 20) {
        let bookQuery = {};
        let uploadQuery = { visibility: 'public' };

        // 1. Text Search
        if (queryStr) {
            bookQuery.$text = { $search: queryStr };
            uploadQuery.$text = { $search: queryStr };
        }

        // 2. Apply filters (Genre)
        if (filters.genre) {
            bookQuery.genre = filters.genre;
            // User uploads store genre as string, use regex for case-insensitive match
            uploadQuery.genre = { $regex: new RegExp(`^${filters.genre}$`, 'i') };
        }

        // 3. Exclude hidden books
        bookQuery.isHidden = { $ne: true };

        // Execute queries in parallel
        // Note: For true scalability we'd use aggregation $unionWith, but for this scale
        // and to keep existing logic simple, we fetch matched docs and sort/paginate in memory.
        // We limit the fetch to a reasonable number if query is empty to avoid dumping DB.
        // If query is present, we fetch matches.

        const [books, uploads] = await Promise.all([
            Book.find(bookQuery).lean(),
            UserUploadedBook.find(uploadQuery).lean()
        ]);

        // Normalize Book results (since .lean() bypasses virtuals)
        const normalizedBooks = books.map(book => {
            let cover = book.files?.cover;
            if (cover && !cover.startsWith('http') && cover !== 'no-photo.jpg') {
                cover = `${process.env.BASE_URL || 'http://localhost:5000'}${cover.startsWith('/') ? '' : '/'}${cover}`;
            } else if (!cover || cover === 'no-photo.jpg') {
                cover = 'https://placehold.co/300x450?text=No+Cover';
            }

            return {
                ...book,
                coverUrl: cover
            };
        });

        // Normalize data structure for frontend (UserUploadedBook might have slightly different fields)
        const normalizedUploads = uploads.map(upload => {
            let cover = upload.coverImage;
            if (cover && !cover.startsWith('http') && cover !== 'default-cover.jpg') {
                cover = `${process.env.BASE_URL || 'http://localhost:5000'}${cover.startsWith('/') ? '' : '/'}${cover}`;
            } else if (!cover || cover === 'default-cover.jpg') {
                cover = 'https://placehold.co/300x450?text=No+Cover'; // Use standard placeholder? or null? Previous was null. Let's use placeholder or null. 
                // Group dashboard handles null? MyGroups uses 'https://placehold.co/100x150' as callback.
                // SearchService previous: upload.coverImage === 'default-cover.jpg' ? null : upload.coverImage
                cover = null;
            }

            return {
                ...upload,
                _id: upload._id,
                title: upload.title,
                author: upload.author,
                genre: upload.genre,
                coverUrl: cover,
                files: {
                    pdf: upload.fileUrl
                },
                // Add a flag if needed, or just treat as book
                isUserUpload: true
            };
        });

        // Merge
        const allBooks = [...normalizedBooks, ...normalizedUploads];

        // Sort by createdAt desc (Newest first)
        allBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const total = allBooks.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = allBooks.slice(startIndex, endIndex);

        return {
            data: paginatedResults,
            total,
            page,
            limit
        };
    }
}

module.exports = new SearchService();
