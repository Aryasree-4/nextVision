const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    activateCourse,
    getMyClassrooms,
    updateClassroomContent,
    enrollStudent,
    getMyEnrollments,
    getAllClassrooms,
    reassignStudent,
    deleteClassroom,
    unenrollStudent,
    markSyllabusViewed,
    updateQuiz,
    activateClassroom,
    getPerformanceTracking
} = require('../controllers/classroomController');

// Middleware for Admin check (reusing inline or extracting)
// Ideal: Extract to authMiddleware.js but for now keep pattern
const adminOnly = (req, res, next) => {
    const User = require('../models/User');
    if (req.session && req.session.userId) {
        User.findById(req.session.userId).then(user => {
            if (user && user.role === 'admin') {
                next();
            } else {
                res.status(401).json({ message: 'Not authorized as an admin' });
            }
        }).catch(err => res.status(500).json({ message: 'Server Error' }));
    } else {
        res.status(401).json({ message: 'Not authorized' });
    }
};

// All routes are protected
router.use(protect);

// Mentor Routes
router.post('/activate', activateCourse);
router.get('/my-classrooms', getMyClassrooms);
router.put('/:id/content', updateClassroomContent);
router.put('/:id/view-syllabus', markSyllabusViewed);
router.put('/:id/quiz', updateQuiz);
router.put('/:id/activate-now', activateClassroom);
router.get('/:id/performance', getPerformanceTracking);

// Learner Routes
router.post('/enroll', enrollStudent);
router.get('/my-enrollments', getMyEnrollments);
router.post('/unenroll', unenrollStudent); // New

// Admin Routes
router.get('/', adminOnly, getAllClassrooms); // View all
router.put('/reassign', adminOnly, reassignStudent); // Reassign
router.delete('/:id', adminOnly, deleteClassroom); // Delete

module.exports = router;
