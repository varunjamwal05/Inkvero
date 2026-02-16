const Book = require('../models/Book');
const ActivityLog = require('../models/ActivityLog');

class TrendingService {
    constructor() {
        this.cache = null;
        this.cacheExpiry = 0;
        this.CACHE_DURATION = 60 * 60 * 1000; // 1 Hour
    }

    async getTrendingBooks() {
        const now = Date.now();

        // 1. Check Cache
        if (this.cache && now < this.cacheExpiry) {
            return this.cache;
        }

        // 2. Refresh Cache (Fallback logic)
        console.log('Refreshing trending cache via aggregation...');

        // Last 7 days
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        const trendingIds = await ActivityLog.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, targetModel: 'Book' } },
            {
                $group: {
                    _id: '$target',
                    score: {
                        $sum: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$action', 'FINISH_READ'] }, then: 10 },
                                    { case: { $eq: ['$action', 'START_READ'] }, then: 3 },
                                    { case: { $eq: ['$action', 'RATE_5'] }, then: 5 },
                                    { case: { $eq: ['$action', 'CREATE_REVIEW'] }, then: 5 }
                                ],
                                default: 1
                            }
                        }
                    }
                }
            },
            { $sort: { score: -1 } },
            { $limit: 10 }
        ]);

        // Populate Book Details
        const bookIds = trendingIds.map(t => t._id);
        const books = await Book.find({ _id: { $in: bookIds } })
            .select('title author files stats');

        // Maintain order
        const sortedBooks = bookIds.map(id => books.find(b => b._id.equals(id))).filter(b => b);

        // Update Cache
        this.cache = sortedBooks;
        this.cacheExpiry = now + this.CACHE_DURATION;

        return sortedBooks;
    }
}

module.exports = new TrendingService();
