
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const countGenres = async () => {
    try {
        console.log('📊 Counting books per genre...');

        const counts = await Book.aggregate([
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('--------------------------------------------------');
        console.log('GENRE | COUNT');
        console.log('--------------------------------------------------');
        counts.forEach(g => {
            console.log(`${g._id.padEnd(20)} | ${g.count}`);
        });
        console.log('--------------------------------------------------');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

countGenres();
