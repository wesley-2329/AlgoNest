// backend/models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    statement: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },
    tags: [String],
    examples: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String }
    }],
    hiddenTestCases: [{
        input: { type: String, required: true },
        output: { type: String, required: true }
    }],
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;