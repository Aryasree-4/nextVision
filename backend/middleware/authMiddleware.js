const User = require('../models/User');

const protect = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select('-password');
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server Error' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no session found' });
    }
};

module.exports = { protect };
