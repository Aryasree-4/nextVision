const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');
const Course = require('./backend/models/Course');
const Classroom = require('./backend/models/Classroom');
const connectDB = require('./backend/config/db');

dotenv.config();

const runVerification = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Clean up previous test data if needed (optional, be careful)
        // await User.deleteMany({ email: { $in: ['admin@test.com', 'mentor@test.com', 'student1@test.com', 'student2@test.com'] } });
        // await Course.deleteMany({ title: 'Test Course 101' });

        // 1. Create Users
        const admin = await User.findOneAndUpdate(
            { email: 'admin@test.com' },
            { name: 'Admin', password: 'password123', role: 'admin' },
            { upsert: true, new: true }
        );
        const mentor = await User.findOneAndUpdate(
            { email: 'mentor@test.com' },
            { name: 'Mentor', password: 'password123', role: 'mentor' },
            { upsert: true, new: true }
        );
        const student1 = await User.findOneAndUpdate(
            { email: 'student1@test.com' },
            { name: 'Student 1', password: 'password123', role: 'learner' },
            { upsert: true, new: true }
        );

        console.log('Users created/found');

        // 2. Create Course
        const course = await Course.create({
            title: 'Test Course 101 ' + Date.now(),
            description: 'Description',
            createdBy: admin._id,
            modules: [{ title: 'Module 1', topics: [{ title: 'Topic 1', content: 'Content 1' }] }],
            isPublished: true
        });
        console.log('Course created:', course._id);

        // 3. Mentor Activates Course
        // Simulate API call
        const classroom = await Classroom.create({
            course: course._id,
            mentor: mentor._id,
            syllabus: course.modules.map(m => ({
                title: m.title,
                topics: m.topics.map(t => ({ title: t.title, content: t.content }))
            })),
            isActive: true,
            students: []
        });
        console.log('Classroom created:', classroom._id);

        // 4. Student Enrolls
        // Simulate Allocation Logic
        const availableClassrooms = await Classroom.find({
            course: course._id,
            isActive: true,
            $expr: { $lt: [{ $size: "$students" }, 20] }
        }).sort({ createdAt: 1 });

        if (availableClassrooms.length > 0) {
            const target = availableClassrooms[0];
            target.students.push(student1._id);
            await target.save();
            console.log(`Student enrolled in classroom: ${target._id} managed by ${target.mentor}`);
        } else {
            console.error('No classroom found!');
        }

        // Verify
        const updatedClassroom = await Classroom.findById(classroom._id);
        if (updatedClassroom.students.includes(student1._id)) {
            console.log('SUCCESS: Student allocation verified.');
        } else {
            console.error('FAILURE: Student not found in classroom.');
        }

    } catch (error) {
        console.error('Validation Error:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

runVerification();
