const EventJob = require('../models/EventJob');
const ActivityLog = require('../models/ActivityLog');
const Book = require('../models/Book');

class WorkerService {
    constructor() {
        this.isRunning = false;
        this.checkInterval = 5000; // Check every 5 seconds
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('Worker Service Started');
        this.processLoop();
    }

    async processLoop() {
        while (this.isRunning) {
            try {
                await this.processNextJob();
            } catch (err) {
                console.error('Worker loop error:', err);
            }
            // Wait before next check
            await new Promise(resolve => setTimeout(resolve, this.checkInterval));
        }
    }

    async processNextJob() {
        // Find pending job
        const job = await EventJob.findOneAndUpdate(
            { status: 'PENDING' },
            { status: 'PROCESSING', processedAt: Date.now() },
            { sort: { createdAt: 1 } } // FIFO
        );

        if (!job) return;

        try {
            console.log(`Processing job ${job._id} type: ${job.type}`);

            switch (job.type) {
                case 'ACTIVITY_LOG':
                    await ActivityLog.create(job.payload);
                    break;

                case 'UPDATE_BOOK_STATS':
                    await this.updateBookStats(job.payload);
                    break;

                case 'TRENDING_CALC':
                    // We'd call TrendingService.calculate() here
                    // For now just log
                    console.log('Calculating trending...');
                    break;

                default:
                    console.warn(`Unknown job type: ${job.type}`);
            }

            job.status = 'COMPLETED';
            await job.save();

        } catch (err) {
            console.error(`Job ${job._id} failed:`, err);
            job.status = 'FAILED';
            job.errorMessage = err.message;
            await job.save();
        }
    }

    async updateBookStats({ bookId, rating }) {
        if (!rating) return;

        // Atomic update
        // Running avg approximation: 
        // This is hard to do purely atomically without reading old values if we want exact math.
        // Simpler approach for MVP: $inc count, and we just push rating to array? No, array is too big.
        // We'll use the "Increment and drift" approach, and rely on a weekly "VerifyBookStatsJob" to fix.

        // But we need the *current* avg to update it atomically?
        // UserBookState is the source of truth.
        // For now, let's just do a read-update-write but inside the worker it's safer than HTTP request.
        // Or just inc count and re-calc average from aggregation?
        // Let's do Aggregation. It's safer.

        const stats = await Book.aggregate([
            { $match: { _id: require('mongoose').Types.ObjectId(bookId) } },
            // Actually we need to aggregate UserBookStates for this book
            // ...
        ]);

        // Changing approach: Just increment count.
        await Book.findByIdAndUpdate(bookId, {
            $inc: { 'stats.ratingCount': 1 }
        });
        // For avgRating, we really need to re-calculate from UserBookStates.
        // Trigger Recalculate Logic
        const result = await require('../models/UserBookState').aggregate([
            { $match: { book: require('mongoose').Types.ObjectId(bookId), rating: { $exists: true } } },
            { $group: { _id: '$book', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        if (result.length > 0) {
            await Book.findByIdAndUpdate(bookId, {
                'stats.avgRating': result[0].avg,
                'stats.ratingCount': result[0].count
            });
        }
    }
}

module.exports = new WorkerService();
