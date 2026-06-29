// routes/authRoutes.js
const express = require('express');
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getCurrentUser // Import this
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import protect
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getCurrentUser); // Add this line
module.exports = router;