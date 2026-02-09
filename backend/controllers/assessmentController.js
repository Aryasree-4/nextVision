const Classroom = require('../models/Classroom');
const Progress = require('../models/Progress');

// @desc    Get Quiz for a module
// @route   GET /api/assessments/:classroomId/quiz/:moduleIndex
// @access  Private/Learner
const getQuiz = async (req, res) => {
    try {
        const { classroomId, moduleIndex } = req.params;
        const classroom = await Classroom.findById(classroomId);

        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        const quiz = classroom.quizzes.find(q => q.moduleIndex == moduleIndex);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found for this module' });

        // Hide correct answers when sending to learner
        const learnerQuiz = {
            moduleIndex: quiz.moduleIndex,
            questions: quiz.questions.map(q => ({
                question: q.question,
                options: q.options,
                _id: q._id
            }))
        };

        res.status(200).json(learnerQuiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit Quiz
// @route   POST /api/assessments/submit
// @access  Private/Learner
const submitQuiz = async (req, res) => {
    try {
        const { classroomId, moduleIndex, answers } = req.body;
        const studentId = req.session.userId;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        const quiz = classroom.quizzes.find(q => q.moduleIndex == moduleIndex);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= 50;

        // Update Progress
        const progress = await Progress.findOne({ studentId, classroomId });
        if (!progress) return res.status(404).json({ message: 'Progress record not found' });

        const modProgress = progress.moduleProgress.find(mp => mp.moduleIndex == moduleIndex);
        if (modProgress) {
            modProgress.attempts += 1;
            if (passed) {
                modProgress.completed = true;
                modProgress.passStatus = true;
                modProgress.quizScore = score;
            } else {
                // If failed, we don't update completed/passStatus/score (requirement: no marks shown if failed)
            }
        }

        // Check for course completion
        const allModulesCompleted = progress.moduleProgress.every(mp => mp.completed);
        if (allModulesCompleted) {
            progress.isCourseCompleted = true;
        }

        await progress.save();

        if (passed) {
            return res.status(200).json({
                passed: true,
                score,
                totalQuestions,
                percentage,
                correctAnswers: quiz.questions.map(q => q.correctAnswer), // Requirement: Show correct answers if passed
                message: 'Congratulations! You have passed the assessment.'
            });
        } else {
            return res.status(200).json({
                passed: false,
                message: 'You did not achieve the minimum score. Please try again.'
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Progress for current student
// @route   GET /api/assessments/progress/:classroomId
// @access  Private/Learner
const getMyProgress = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const studentId = req.session.userId;

        const progress = await Progress.findOne({ studentId, classroomId });
        if (!progress) return res.status(404).json({ message: 'Progress not found' });

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getQuiz,
    submitQuiz,
    getMyProgress
};
