const express = require('express');
const { createRoom, getRoom, getRoomsList } = require('../controllers/roomController.js');
const { protect } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.route('/')
    .post(protect, createRoom)
    .get(protect, getRoomsList);

router.route('/:roomId')
    .get(protect, getRoom);

module.exports = router;
