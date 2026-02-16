
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('./models/Book');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const debug = async () => {
    try {
        console.log('🔍 Inspecting Database...');

        const sample = await Book.findOne();
        console.log('📄 SAMPLE BOOK JSON:', JSON.stringify(sample, null, 2));

        if (sample) {
            console.log('--------------------------------------------------');
            console.log('Title:', sample.title);
            console.log('Genre Field Type:', typeof sample.genre);
            console.log('Genre Value:', sample.genre);
            console.log('Cover Field (files.cover):', sample.files?.cover);
        }

        const genres = await Book.distinct('genre');
        console.log('--------------------------------------------------');
        console.log('📂 Distinct Genres found in DB:', genres);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
