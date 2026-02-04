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

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

// Routes
router.route('/')
    .get(protect, getCourses)
    .post(protect, upload.single('coverImage'), createCourse);

router.route('/:id')
    .get(protect, getCourse)
    .put(protect, upload.single('coverImage'), updateCourse)
    .delete(protect, deleteCourse);

module.exports = router;
