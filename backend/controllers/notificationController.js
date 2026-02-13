const Notification = require('../models/Notification');
const Classroom = require('../models/Classroom');

// @desc    Send a notification (Broadcast)
// @route   POST /api/notifications/broadcast
// @access  Private (Mentor only)
const sendNotification = async (req, res) => {
    try {
        const { classroomId, message, link } = req.body;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if the user is the mentor of this classroom
        if (classroom.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only mentors can broadcast messages' });
        }

        const notification = await Notification.create({
            classroom: classroomId,
            sender: req.user._id,
            message,
            link: link || ''
        });

        // Emit socket event (This will be handled in server.js)
        if (global.io) {
            global.io.to(classroomId).emit('newNotification', notification);
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all notifications for a classroom
// @route   GET /api/notifications/:classroomId
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const notifications = await Notification.find({ classroom: classroomId })
            .sort({ createdAt: -1 })
            .populate('sender', 'name profilePicture');

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    React to a notification
// @route   POST /api/notifications/:id/react
// @access  Private
const reactToNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if user already reacted
        const existingReaction = notification.reactions.find(r => r.user.toString() === req.user._id.toString());

        if (existingReaction) {
            // Remove reaction if exists (Toggle)
            notification.reactions = notification.reactions.filter(r => r.user.toString() !== req.user._id.toString());
        } else {
            notification.reactions.push({ user: req.user._id });
        }

        await notification.save();

        if (global.io) {
            global.io.to(notification.classroom.toString()).emit('reactionUpdated', {
                notificationId: notification._id,
                reactions: notification.reactions
            });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    sendNotification,
    getNotifications,
    reactToNotification,
    markAsRead
};
