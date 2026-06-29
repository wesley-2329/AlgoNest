const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
    },
    code: {
        type: String,
        default: '// Solve the assigned problem here',
    },
    language: {
        type: String,
        default: 'cpp',
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    hintsRevealed: [{
        type: Number, // indices of revealed hints (e.g. 0, 1, 2)
    }],
    notes: {
        type: String,
        default: '', // Private interviewer notes
    },
    feedback: {
        type: String,
        default: '', // Post-interview summary feedback
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
