const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@inkvero.com';
        const password = 'adminpassword123';
        const username = 'AdminUser';

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user already exists. Updating role and password...');
            user.password = password;
            user.role = 'admin';
            await user.save();
        } else {
            console.log('Creating new admin user...');
            user = await User.create({
                username,
                email,
                password,
                role: 'admin'
            });
        }

        console.log(`\nAdmin Credentials Created:\nEmail: ${email}\nPassword: ${password}`);

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
