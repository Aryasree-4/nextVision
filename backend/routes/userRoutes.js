const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllUsers, createUser, deleteUser } = require('../controllers/userController');

// Middleware to check for Admin role
const adminOnly = (req, res, next) => {
    // We need to fetch the user or rely on session if role is stored there
    // For now assuming we can fetch user from session ID again or improved protect middleware
    // Let's assume protect middleware gives us user context if we enhance it, 
    // OR we check via DB here.
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

router.use(protect);
router.use(adminOnly);

router.get('/', getAllUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);

module.exports = router;
