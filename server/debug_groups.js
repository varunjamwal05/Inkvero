const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Group = require('./models/Group');
const Book = require('./models/Book');
const UserUploadedBook = require('./models/UserUploadedBook');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const debugGroups = async () => {
    await connectDB();

    const groups = await Group.find().populate('currentBook');

    console.log('--- GROUPS DEBUG ---');
    for (const group of groups) {
        console.log(`Group: ${group.name} | ID: ${group._id}`);

        if (group.currentBook) {
            console.log(`CurrentBook ID: ${group.currentBook._id}`);
            console.log(`CurrentBook Title: ${group.currentBook.title}`);
            console.log(`CurrentBook Model: ${group.currentBook.constructor.modelName}`);
            // Check for files.cover
            if (group.currentBook.files) {
                console.log(`Files.Cover: ${group.currentBook.files.cover}`);
            } else {
                console.log(`Files property missing on populated object`);
                // Check if it has coverImage (UserUploadedBook)
                if (group.currentBook.coverImage) {
                    console.log(`CoverImage (UserUpload): ${group.currentBook.coverImage}`);
                }
            }
        } else {
            console.log(`CurrentBook is NULL`);
            // Check raw
            const rawGroup = await Group.findById(group._id);
            console.log(`Raw CurrentBook ID: ${rawGroup.currentBook}`);

            if (rawGroup.currentBook) {
                const upload = await UserUploadedBook.findById(rawGroup.currentBook);
                if (upload) {
                    console.log(`FOUND in UserUploadedBook! Title: ${upload.title}, Cover: ${upload.coverImage}`);
                } else {
                    console.log(`NOT found in UserUploadedBook either.`);
                }
            }
        }
    }

    process.exit();
};

debugGroups();
