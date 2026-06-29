// backend/routes/submissionRoutes.js
const express = require('express');
const { createSubmission, getProblemSubmissions, runCustomCode  } = require('../controllers/submissionController.js');
const { protect } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post('/', protect, createSubmission);
router.get('/problem/:problemId', protect, getProblemSubmissions);
router.post('/run-custom', protect, runCustomCode); // <-- Add this line
module.exports = router;