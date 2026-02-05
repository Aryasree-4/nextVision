const protect = (req, res, next) => {
    console.log('Session Check:', req.sessionID, 'User:', req.session?.userId);
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, no session found' });
    }
};

module.exports = { protect };
