const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Mentor cannot edit title
    content: { type: String, required: true }, // Mentor CAN edit content
    originalTopicId: { type: mongoose.Schema.Types.ObjectId } // To track upstream changes if needed later
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Mentor cannot edit title
    topics: [topicSchema],
});

const classroomSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    syllabus: [moduleSchema], // Independent copy for the mentor
    syllabusViewed: {
        type: Boolean,
        default: false
    },
    isActive: { // This now acts as the "activation" flag after conditions met
        type: Boolean,
        default: false
    },
    quizzes: [{
        moduleIndex: Number,
        questions: [{
            question: String,
            options: [String],
            correctAnswer: String
        }]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Classroom', classroomSchema);
