const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new user (Admin manual creation)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password: password || 'password123', // Default if not provided
            role: role || 'learner'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting self (optional but good practice)
        if (user._id.toString() === req.session.userId) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        await user.deleteOne();
        res.status(200).json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile/:id
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile (Self)
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        console.log('--- Profile Update Attempt ---');
        console.log('User ID from Session:', req.session.userId);
        console.log('Request Body:', req.body);
        console.log('Request File:', req.file ? req.file.filename : 'None');

        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authorized, session expired' });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            console.warn(`User with ID ${req.session.userId} not found in database`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (req.body.bio !== undefined) {
            user.bio = req.body.bio;
        }

        if (req.file) {
            console.log('Processing new profile picture:', req.file.filename);

            // Delete old image if it exists and is not default
            if (user.profilePicture && user.profilePicture !== 'default-profile.png') {
                const oldPath = path.resolve(__dirname, '..', 'public', 'uploads', user.profilePicture);
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                        console.log('Successfully removed old profile picture:', user.profilePicture);
                    } catch (err) {
                        console.error('Error deleting old profile picture:', err.message);
                    }
                }
            }
            user.profilePicture = req.file.filename;
        }

        const updatedUser = await user.save();
        console.log('Profile updated successfully for:', updatedUser.email);

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            bio: updatedUser.bio,
            profilePicture: updatedUser.profilePicture,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('CRITICAL: Profile Update Error:', error);
        res.status(500).json({
            message: 'Server error while updating profile',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    deleteUser,
    updateUserProfile,
    getUserProfile
};
