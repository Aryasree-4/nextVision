const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend dir
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        // Delete users with email starting with "loaduser"
        const result = await User.deleteMany({
            $or: [
                { email: { $regex: /^loaduser/i } },
                { name: { $regex: /^Load Test User/i } }
            ]
        });

        console.log(`Successfully deleted ${result.deletedCount} test users.`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
