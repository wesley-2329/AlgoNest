const express = require('express');
const { 
    explainProblem, 
    debugCode, 
    reviewCode, 
    getHint, 
    getLearningCoach 
} = require('../controllers/aiController.js');
const { protect } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post('/explain', protect, explainProblem);
router.post('/debug', protect, debugCode);
router.post('/review', protect, reviewCode);
router.post('/hint', protect, getHint);
router.get('/learning-coach', protect, getLearningCoach);

module.exports = router;