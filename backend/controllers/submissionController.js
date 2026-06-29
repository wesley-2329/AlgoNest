// backend/controllers/submissionController.js
const Submission = require('../models/Submission.js');
const Problem = require('../models/Problem.js');
const axios = require('axios');

const { submissionQueue } = require('../queue/submissionQueue.js');

exports.createSubmission = async (req, res) => {
    const { language, code, problemId } = req.body;
    const userId = req.user._id;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Save the submission as Pending in the database
        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            verdict: 'Pending',
        });

        // Add grading job to BullMQ queue
        await submissionQueue.add(`submit-${submission._id}`, {
            submissionId: submission._id.toString(),
            code,
            language,
            hiddenTestCases: problem.hiddenTestCases
        });

        res.status(201).json(submission);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getProblemSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({
            userId: req.user._id,
            problemId: req.params.problemId
        }).sort({ createdAt: -1 }); // Sort by most recent

        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};





// Add this function to backend/controllers/submissionController.js

exports.runCustomCode = async (req, res) => {
    const { language, code, input } = req.body;
    try {
        // Directly call the runner service with the provided data
        const runnerResponse = await axios.post('http://localhost:7777/run', {
            language,
            code,
            input,
        });
        // Send the raw response from the runner back to the client
        res.json(runnerResponse.data);
    } catch (err) {
        console.error('RUNNER CALL FAILED:', err.message); 
        res.status(500).json({ 
            message: 'Error executing code', 
            error: err.response ? err.response.data : err.message 
        });
    }
};




// At the bottom of submissionController.js
// module.exports = { createSubmission, getProblemSubmissions };