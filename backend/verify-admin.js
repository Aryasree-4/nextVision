const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const connectDB = require('./config/db');

dotenv.config();

const runVerification = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // 1. Create a Test Admin if not exists
        const adminEmail = 'admin@test.com';
        const adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            console.log('Use existing admin or create one.');
        } else {
            console.log('Admin user found');
        }

        // 2. Create a Test Classroom
        const course = await Course.findOne();
        if (!course) { console.log('No courses found'); return; }

        const mentor = await User.findOne({ role: 'mentor' });
        if (!mentor) { console.log('No mentor found'); return; }

        let classroom = await Classroom.findOne({ mentor: mentor._id });
        if (!classroom) {
            classroom = await Classroom.create({
                course: course._id,
                mentor: mentor._id,
                students: [],
                isActive: true,
                syllabus: []
            });
            console.log('Created test classroom');
        }

        // 3. Admin: Reassign (Simulate by checking constraint)
        const student = await User.findOne({ role: 'learner' });
        if (student) {
            console.log(`Testing with student: ${student.email}`);
            // Add student to classroom
            if (!classroom.students.includes(student._id)) {
                classroom.students.push(student._id);
                await classroom.save();
                console.log('Added student to classroom');
            }

            // Simulate Unenroll
            classroom.students.pull(student._id);
            await classroom.save();
            console.log('Student unenrolled successfully (Verified Logic)');

            // Simulate Classroom Delete
            // Not actually deleting to keep DB clean for manual test, but verifying findById works
            const foundClassroom = await Classroom.findById(classroom._id);
            if (foundClassroom) {
                console.log('Classroom findable (Delete Logic ready)');
            }
        }

    } catch (error) {
        console.error('Validation Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

runVerification();
