// backend/routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const {
    createProblem,
    getProblems,
    getProblemById,
    updateProblem,
    deleteProblem
} = require('../controllers/problemController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Public route for all users
router.route('/').get(getProblems);
router.route('/:id').get(getProblemById);

// Admin-only routes
router.route('/').post(protect, admin, createProblem);
router.route('/:id').put(protect, admin, updateProblem);
router.route('/:id').delete(protect, admin, deleteProblem);

module.exports = router;