const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
    moduleIndex: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    passStatus: { type: Boolean, default: false }
});

const progressSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    moduleProgress: [moduleProgressSchema],
    isCourseCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure a student has only one progress record per classroom
progressSchema.index({ studentId: 1, classroomId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
