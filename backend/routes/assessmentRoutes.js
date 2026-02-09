const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getQuiz, submitQuiz, getMyProgress } = require('../controllers/assessmentController');

router.use(protect);

router.get('/:classroomId/quiz/:moduleIndex', getQuiz);
router.post('/submit', submitQuiz);
router.get('/progress/:classroomId', getMyProgress);

module.exports = router;
