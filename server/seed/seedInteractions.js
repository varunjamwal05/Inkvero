const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const User = require('../models/User');
const UserBookState = require('../models/UserBookState');
const connectDB = require('../config/db');

dotenv.config();

const seedInteractions = async () => {
    try {
        await connectDB();
        console.log('🔌 DB Connected');

        // Clear existing interactions to avoid duplicates/conflicts
        await UserBookState.deleteMany({});
        console.log('🧹 Cleared old interactions');

        const users = await User.find({});
        const books = await Book.find({});

        if (books.length === 0) {
            console.error('❌ No books found. Run seedRealBooks.js first.');
            process.exit(1);
        }

        const interactions = [];
        const statuses = ['READING', 'COMPLETED', 'WANT_TO_READ'];

        for (const user of users) {
            // Assign 3-5 random books to each user
            const numBooks = Math.floor(Math.random() * 3) + 3;
            // Shuffle books array to pick random ones
            const shuffled = books.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, numBooks);

            for (const book of selected) {
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                let progress = 0;
                if (status === 'COMPLETED') progress = 100;
                else if (status === 'READING') progress = Math.floor(Math.random() * 80) + 10;

                interactions.push({
                    user: user._id,
                    book: book._id,
                    status: status,
                    progress: progress,
                    rating: status === 'COMPLETED' ? Math.floor(Math.random() * 2) + 4 : undefined,
                    lastInteractedAt: new Date()
                });
            }
        }

        await UserBookState.insertMany(interactions);
        console.log(`✅ Seeded ${interactions.length} interactions for ${users.length} users.`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

seedInteractions();
