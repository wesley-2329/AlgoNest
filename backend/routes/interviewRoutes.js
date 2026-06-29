const express = require('express');
const { createInterview, getInterview, getInterviewsList, submitFeedback } = require('../controllers/interviewController.js');
const { protect } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.route('/')
    .post(protect, createInterview)
    .get(protect, getInterviewsList);

router.route('/:sessionId')
    .get(protect, getInterview);

router.route('/:sessionId/feedback')
    .put(protect, submitFeedback);

module.exports = router;
