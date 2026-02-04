const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminExists = await User.findOne({ email: 'admin@nextvision.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'admin@nextvision.com',
            password: 'AdminPassword123!',
            role: 'admin'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@nextvision.com');
        console.log('Password: AdminPassword123!');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
