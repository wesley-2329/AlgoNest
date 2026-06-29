const express = require('express');
const { getDashboardStats } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;
