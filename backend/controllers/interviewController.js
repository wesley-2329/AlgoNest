const Interview = require('../models/Interview.js');
const User = require('../models/User.js');
const { v4: uuidv4 } = require('uuid');

exports.createInterview = async (req, res) => {
    try {
        const { candidateEmail, problemId } = req.body;
        
        // Find candidate user
        const candidate = await User.findOne({ email: candidateEmail });
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate user not found' });
        }

        const sessionId = `interview-${uuidv4().substring(0, 8)}`;

        const interview = await Interview.create({
            sessionId,
            interviewerId: req.user._id,
            candidateId: candidate._id,
            problemId: problemId || undefined,
        });

        res.status(201).json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create interview session', error: error.message });
    }
};

exports.getInterview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const interview = await Interview.findOne({ sessionId })
            .populate('problemId')
            .populate('interviewerId', 'username email')
            .populate('candidateId', 'username email');

        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch interview session', error: error.message });
    }
};

exports.getInterviewsList = async (req, res) => {
    try {
        // Find interviews where the user is either candidate or interviewer
        const interviews = await Interview.find({
            $or: [
                { interviewerId: req.user._id },
                { candidateId: req.user._id }
            ]
        })
        .populate('problemId')
        .populate('interviewerId', 'username email')
        .populate('candidateId', 'username email')
        .sort({ createdAt: -1 });

        res.json(interviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch interviews list', error: error.message });
    }
};

exports.submitFeedback = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { notes, feedback, status = 'completed' } = req.body;

        const interview = await Interview.findOneAndUpdate(
            { sessionId },
            { notes, feedback, status },
            { new: true }
        );

        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        res.json(interview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update interview feedback', error: error.message });
    }
};
