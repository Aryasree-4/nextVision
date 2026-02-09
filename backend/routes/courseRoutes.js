const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createCourse,
    getCourses,
    getCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Routes
router.route('/')
    .get(protect, getCourses)
    .post(protect, upload.single('coverImage'), createCourse);

router.route('/:id')
    .get(protect, getCourse)
    .put(protect, upload.single('coverImage'), updateCourse)
    .delete(protect, deleteCourse);

module.exports = router;
