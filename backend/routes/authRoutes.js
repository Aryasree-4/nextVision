const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .isEmail().withMessage('Please include a valid email')
        .normalizeEmail()
        .toLowerCase(),

    body('password')
        .trim()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Please include a valid email')
        .normalizeEmail(),

    body('password').notEmpty().withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
