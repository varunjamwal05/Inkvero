const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' }); // Adjust path if needed, usually run from root so just .env? 
// Actually script might be run from root as `node server/utils/seedAdmin.js`
// So dotenv.config() needs to find .env. If specific path needed:
// dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

dotenv.config();

const makeAdmin = async () => {
    try {
        const email = process.argv[2];

        if (!email) {
            console.log('Please provide an email: node server/utils/seedAdmin.js <email>');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success! User ${user.username} (${user.email}) is now an ADMIN.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

makeAdmin();
