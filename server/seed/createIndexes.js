const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserUploadedBook = require('../models/UserUploadedBook');

dotenv.config();

const createIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        console.log('Creating indexes for UserUploadedBook...');
        await UserUploadedBook.init();
        await UserUploadedBook.createIndexes();

        console.log('Indexes created successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createIndexes();
