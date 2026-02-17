const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`- ${user.username} (${user.email}) Role: ${user.role}`);
        });

        if (users.length === 0) {
            console.log('No users found. You may need to register a new user.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
