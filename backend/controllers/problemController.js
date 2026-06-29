// backend/controllers/problemController.js
const Problem = require('../models/Problem.js');

// @desc    Create a problem
// @route   POST /api/problems
// @access  Private/Admin
const createProblem = async (req, res) => {
    try {
        const problem = new Problem({ ...req.body });
        const createdProblem = await problem.save();
        res.status(201).json(createdProblem);
    } catch (error) {
        res.status(400).json({ message: `Error creating problem: ${error.message}` });
    }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}).select('title difficulty tags');
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: `Error fetching problems: ${error.message}` });
    }
};

// @desc    Get single problem by ID
// @route   GET /api/problems/:id
// @access  Public
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (problem) {
            res.json(problem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error fetching problem: ${error.message}` });
    }
};

// @desc    Update a problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (problem) {
            res.json(problem);
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(400).json({ message: `Error updating problem: ${error.message}` });
    }
};

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id);
        if (problem) {
            res.json({ message: 'Problem removed' });
        } else {
            res.status(404).json({ message: 'Problem not found' });
        }
    } catch (error) {
        res.status(500).json({ message: `Error deleting problem: ${error.message}` });
    }
};

module.exports = { createProblem, getProblems, getProblemById, updateProblem, deleteProblem };