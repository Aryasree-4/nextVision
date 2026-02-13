const express = require('express');
const router = express.Router();
const {
    sendNotification,
    getNotifications,
    reactToNotification,
    markAsRead
} = require('../controllers/notificationController');

// All routes require authentication
// Assuming there's a middleware to protect routes and set req.user
// I'll check existing routes to see how they handle auth.
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/broadcast', sendNotification);
router.get('/:classroomId', getNotifications);
router.post('/:id/react', reactToNotification);
router.post('/:id/read', markAsRead);

module.exports = router;
