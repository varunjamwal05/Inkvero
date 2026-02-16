const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const UserBookState = require('../models/UserBookState');
const ActivityLog = require('../models/ActivityLog'); // Assuming this exists based on controller

dotenv.config();

const clearLibrary = async () => {
    try {
        await connectDB();
        console.log('🔌 DB Connected');

        console.log('🧹 Clearing UserBookState (My Library)...');
        await UserBookState.deleteMany({});
        console.log('✔ UserBookState cleared.');

        // Also clear activity logs to be safe
        try {
            console.log('🧹 Clearing ActivityLog...');
            await ActivityLog.deleteMany({});
            console.log('✔ ActivityLog cleared.');
        } catch (e) {
            console.log('⚠️ Could not clear ActivityLog (might not exist or different name), skipping.');
        }

        console.log('✅ Library cleared successfully. Dashboard should work now.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

clearLibrary();
