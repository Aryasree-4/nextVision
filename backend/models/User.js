const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Do not return password by default
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ['learner', 'mentor', 'admin'],
            default: 'learner',
        },
        bio: {
            type: String,
            default: '',
        },
        profilePicture: {
            type: String,
            default: 'default-profile.png',
        },
        securityQuestion: {
            type: String,
            required: true,
        },
        securityAnswer: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('securityAnswer')) {
        const salt = await bcrypt.genSalt(10);
        // Lowercase the answer before hashing for case-insensitive matching later
        const lowercasedAnswer = this.securityAnswer.toLowerCase().trim();
        this.securityAnswer = await bcrypt.hash(lowercasedAnswer, salt);
    }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Match security answer
userSchema.methods.matchSecurityAnswer = async function (enteredAnswer) {
    const lowercasedAnswer = enteredAnswer.toLowerCase().trim();
    return await bcrypt.compare(lowercasedAnswer, this.securityAnswer);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
