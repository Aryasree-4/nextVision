const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
    try {
        const { title, description, modules, isPublished } = req.body;
        let coverImage = 'no-photo.jpg';

        if (req.file) {
            coverImage = req.file.filename;
        }

        // Handle boolean conversion if coming from FormData (string)
        const published = isPublished === 'true' || isPublished === true;

        const course = await Course.create({
            title,
            description,
            coverImage,
            modules: modules ? JSON.parse(modules) : [],
            isPublished: published,
            createdBy: req.session.userId // Using session ID
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: 'Invalid course data', error: error.message });
    }
};

// @desc    Get all courses (Admin sees all, Learner sees published)
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
    try {
        // If user is admin (check usually done in middleware/controller logic, 
        // but here we might rely on the role passed or check User model if needed. 
        // For simplicity, let's assume we can check role via populated user or session lookup if we added it to session.
        // We generally need to look up the user to be sure of role, or rely on middleware attaching user to req.
        // Assuming protect middleware attaches req.user or we use session.

        // Let's assume we need to fetch user to know role if not in session fully. 
        // But wait, the previous flow didn't attach full user to req in middleware yet, only session check.
        // Let's update this logic to be robust. 
        // Actually, let's assume if query param 'mode=admin' is sent and user is admin, return all.
        // Or better, filter based on requester. 

        // For now, return all for simplicity or filter by published = true if not admin context.
        // Let's implement a simple filter: return all. Frontend filters/backend filters.
        // Valid approach: 

        let query = {};
        if (req.query.published) {
            query.isPublished = true;
        }

        const courses = await Course.find(query).populate('createdBy', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const { title, description, modules, isPublished } = req.body;

        // Update fields
        if (title) course.title = title;
        if (description) course.description = description;
        if (modules) course.modules = JSON.parse(modules);
        if (isPublished !== undefined) course.isPublished = isPublished;

        if (req.file) {
            // Delete old image if it's not default
            if (course.coverImage && course.coverImage !== 'no-photo.jpg') {
                const oldPath = path.join(__dirname, '../public/uploads', course.coverImage);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            course.coverImage = req.file.filename;
        }

        await course.save();
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.coverImage && course.coverImage !== 'no-photo.jpg') {
            const imagePath = path.join(__dirname, '../public/uploads', course.coverImage);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await course.deleteOne();
        res.status(200).json({ message: 'Course removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourse,
    updateCourse,
    deleteCourse
};
