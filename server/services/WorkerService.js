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
        const mongoose = require('mongoose');
        const UserBookState = require('../models/UserBookState');

        try {
            const objectId = new mongoose.Types.ObjectId(bookId);

            // Re-calculate average from UserBookStates
            const result = await UserBookState.aggregate([
                { $match: { book: objectId, rating: { $exists: true, $ne: null } } },
                { $group: { _id: '$book', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]);

            if (result.length > 0) {
                await Book.findByIdAndUpdate(bookId, {
                    'stats.avgRating': result[0].avg,
                    'stats.ratingCount': result[0].count
                });
                console.log(`Updated stats for book ${bookId}: Avg ${result[0].avg}, Count ${result[0].count}`);
            } else {
                // Handle case where all reviews might be removed (unlikely but possible)
                await Book.findByIdAndUpdate(bookId, {
                    'stats.avgRating': 0,
                    'stats.ratingCount': 0
                });
            }
        } catch (error) {
            console.error('Error updating book stats:', error);
        }
    }
}

module.exports = new WorkerService();
