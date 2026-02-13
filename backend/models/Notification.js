const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String, // For activities like doubt-clearance sessions
        default: ''
    },
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            default: '👍'
        }
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
