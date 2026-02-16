const User = require('../models/User');
const Classroom = require('../models/Classroom');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Resign mentor and clean up resources
 * @route   POST /api/users/resign
 * @access  Private (Mentor only)
 */
exports.resignMentor = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'mentor') {
            return res.status(403).json({ message: 'Only mentors can resign through this workflow.' });
        }

        // 1. Handle Certificate Backup (Metadata/Buffer from frontend)
        // The frontend will send the base64 or some representation if they want the backend to save it.
        // For now, we expect the frontend to provide the certificate data if we want a backup.
        const { certificateData, fileName } = req.body;

        if (certificateData) {
            const backupDir = path.join(__dirname, '..', 'public', 'uploads', 'backups', 'certificates');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const filePath = path.join(backupDir, fileName || `backup_${user._id}_${Date.now()}.pdf`);
            const base64Data = certificateData.replace(/^data:application\/pdf;base64,/, "");
            fs.writeFileSync(filePath, base64Data, 'base64');
        }

        // 2. Delete all classrooms created by this mentor
        await Classroom.deleteMany({ mentor: user._id });

        // 3. Delete the user account
        await User.findByIdAndDelete(user._id);

        // 4. Force logout (clear session/cookie if applicable)
        res.clearCookie('token');
        if (req.session) {
            req.session.destroy();
        }

        res.status(200).json({ message: 'Resignation successful. Account and data removed.' });
    } catch (error) {
        console.error('Resignation Error:', error);
        res.status(500).json({ message: 'Server error during resignation process.' });
    }
};
