const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createDemoUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'demo@inkvero.com';
        const password = 'password123';
        const username = 'DemoUser';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('Demo user already exists. resetting password...');
            user.password = password; // Will be hashed by pre-save hook
            await user.save();
            console.log('Password reset to:', password);
        } else {
            console.log('Creating new demo user...');
            user = await User.create({
                username,
                email,
                password
            });
            console.log('Demo user created.');
        }

        console.log(`\nCredentials:\nEmail: ${email}\nPassword: ${password}`);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createDemoUser();
