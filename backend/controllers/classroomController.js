const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

// @desc    Activate a course (Create Classroom for Mentor)
// @route   POST /api/classrooms/activate
// @access  Private/Mentor
const activateCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const mentorId = req.session.userId;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const syllabusCopy = course.modules.map(module => ({
            title: module.title,
            topics: module.topics.map(topic => ({
                title: topic.title,
                content: topic.content
            }))
        }));

        const classroom = await Classroom.create({
            course: courseId,
            mentor: mentorId,
            syllabus: syllabusCopy,
            isActive: false, // Start as inactive until mentor satisfies conditions
            students: []
        });

        res.status(201).json(classroom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark Syllabus as Viewed
// @route   PUT /api/classrooms/:id/view-syllabus
// @access  Private/Mentor
const markSyllabusViewed = async (req, res) => {
    try {
        const classroom = await Classroom.findOneAndUpdate(
            { _id: req.params.id, mentor: req.session.userId },
            { syllabusViewed: true },
            { new: true }
        );
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
        res.status(200).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add or Update Quiz for a Module
// @route   PUT /api/classrooms/:id/quiz
// @access  Private/Mentor
const updateQuiz = async (req, res) => {
    try {
        const { moduleIndex, questions } = req.body;
        if (!questions || questions.length < 4) {
            return res.status(400).json({ message: 'Quiz must have at least 4 questions' });
        }

        const classroom = await Classroom.findOne({ _id: req.params.id, mentor: req.session.userId });
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        const quizIndex = classroom.quizzes.findIndex(q => q.moduleIndex === moduleIndex);
        if (quizIndex !== -1) {
            classroom.quizzes[quizIndex].questions = questions;
        } else {
            classroom.quizzes.push({ moduleIndex, questions });
        }

        await classroom.save();
        res.status(200).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Activate Classroom
// @route   PUT /api/classrooms/:id/activate-now
// @access  Private/Mentor
const activateClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findOne({ _id: req.params.id, mentor: req.session.userId });
        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        if (!classroom.syllabusViewed) {
            return res.status(400).json({ message: 'You must view the syllabus before activation' });
        }

        const hasModule1Quiz = classroom.quizzes.some(q => q.moduleIndex === 0);
        if (!hasModule1Quiz) {
            return res.status(400).json({ message: 'You must create the first module quiz before activation' });
        }

        classroom.isActive = true;
        await classroom.save();
        res.status(200).json({ message: 'Classroom activated successfully', classroom });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Mentor's Classrooms
// @route   GET /api/classrooms/my-classrooms
// @access  Private/Mentor
const getMyClassrooms = async (req, res) => {
    try {
        const mentorId = req.session.userId;
        const classrooms = await Classroom.find({ mentor: mentorId })
            .populate('course', 'title coverImage')
            .populate('students', 'name email');

        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update Classroom Content (Syllabus)
// @route   PUT /api/classrooms/:id/content
// @access  Private/Mentor
const updateClassroomContent = async (req, res) => {
    try {
        const { moduleId, topicId, content } = req.body;
        const classroomId = req.params.id;
        const mentorId = req.session.userId;

        const classroom = await Classroom.findOne({ _id: classroomId, mentor: mentorId });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found or unauthorized' });
        }

        const module = classroom.syllabus.id(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }

        const topic = module.topics.id(topicId);
        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        topic.content = content;
        await classroom.save();

        res.status(200).json(classroom);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Enroll Student in a Course (Allocate to Classroom)
// @route   POST /api/classrooms/enroll
// @access  Private/Learner
const enrollStudent = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.session.userId;

        // --- ENROLLMENT RULE: One course at a time ---
        const activeProgress = await Progress.findOne({
            studentId,
            isCourseCompleted: false
        });

        if (activeProgress) {
            return res.status(400).json({
                message: 'Enrollment Blocked: You can only register for one course at a time. Please complete or withdraw from your current subject before starting a new one.'
            });
        }
        // --- END RULE ---

        const existingEnrollment = await Classroom.findOne({
            course: courseId,
            students: studentId
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        const availableClassrooms = await Classroom.find({
            course: courseId,
            isActive: true,
            $expr: { $lt: [{ $size: "$students" }, 20] }
        }).sort({ createdAt: 1 });

        if (availableClassrooms.length === 0) {
            return res.status(404).json({
                message: 'No available classrooms for this course at the moment. Please try again later.'
            });
        }

        const targetClassroom = availableClassrooms[0];
        targetClassroom.students.push(studentId);
        await targetClassroom.save();

        // Initialize Progress
        await Progress.create({
            studentId,
            classroomId: targetClassroom._id,
            moduleProgress: targetClassroom.syllabus.map((_, index) => ({
                moduleIndex: index,
                completed: false,
                quizScore: 0,
                attempts: 0,
                passStatus: false
            }))
        });

        res.status(200).json({
            message: 'Enrolled successfully',
            classroomId: targetClassroom._id,
            mentorId: targetClassroom.mentor
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Student's Enrolled Classrooms
// @route   GET /api/classrooms/my-enrollments
// @access  Private/Learner
const getMyEnrollments = async (req, res) => {
    try {
        const studentId = req.session.userId;
        const classrooms = await Classroom.find({ students: studentId })
            .populate('course', 'title coverImage')
            .populate('mentor', 'name');

        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- New Admin & Learner Features ---

// @desc    Get All Classrooms (Admin)
// @route   GET /api/classrooms
// @access  Private/Admin
const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({})
            .populate('course', 'title')
            .populate('mentor', 'name email')
            .populate('students', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reassign Student to another Classroom
// @route   PUT /api/classrooms/reassign
// @access  Private/Admin
const reassignStudent = async (req, res) => {
    try {
        const { studentId, fromClassroomId, toClassroomId } = req.body;

        const fromClassroom = await Classroom.findById(fromClassroomId);
        const toClassroom = await Classroom.findById(toClassroomId);

        if (!fromClassroom || !toClassroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check constraints
        if (toClassroom.students.length >= 20) {
            return res.status(400).json({ message: 'Target classroom is full' });
        }
        if (fromClassroom.course.toString() !== toClassroom.course.toString()) {
            return res.status(400).json({ message: 'Classrooms must belong to the same course' });
        }

        // Move student
        fromClassroom.students.pull(studentId);
        toClassroom.students.push(studentId);

        await fromClassroom.save();
        await toClassroom.save();

        res.status(200).json({ message: 'Student reassigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete Classroom (Admin)
// @route   DELETE /api/classrooms/:id
// @access  Private/Admin
const deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Deleting classroom automatically "unenrolls" students effectively as they are just references in this array
        // They fall back to course selection.
        await classroom.deleteOne();
        res.status(200).json({ message: 'Classroom deleted and students unenrolled' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Unenroll / Quit Course (Learner)
// @route   POST /api/classrooms/unenroll
// @access  Private/Learner
const unenrollStudent = async (req, res) => {
    try {
        const { classroomId } = req.body; // Ideally we just need classroomId
        const studentId = req.session.userId;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if student is in this classroom
        if (!classroom.students.some(id => id.toString() === studentId.toString())) {
            return res.status(400).json({ message: 'You are not validly enrolled in this classroom' });
        }

        classroom.students.pull(studentId);
        await classroom.save();

        res.status(200).json({ message: 'Successfully quit the course' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Performance Tracking Data for Mentor
// @route   GET /api/classrooms/:id/performance
// @access  Private/Mentor
const getPerformanceTracking = async (req, res) => {
    try {
        const classroomId = req.params.id;

        const performanceData = await Progress.find({ classroomId })
            .populate('studentId', 'name email')
            .lean();

        res.status(200).json(performanceData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    activateCourse,
    markSyllabusViewed,
    updateQuiz,
    activateClassroom,
    getMyClassrooms,
    updateClassroomContent,
    enrollStudent,
    getMyEnrollments,
    getAllClassrooms,
    reassignStudent,
    deleteClassroom,
    unenrollStudent,
    getPerformanceTracking
};
