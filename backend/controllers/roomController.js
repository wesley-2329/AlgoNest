const Room = require('../models/Room.js');
const { v4: uuidv4 } = require('uuid');

exports.createRoom = async (req, res) => {
    try {
        const { title = 'Untitled Room', problemId = null } = req.body;
        const roomId = `room-${uuidv4().substring(0, 8)}`;

        const room = await Room.create({
            roomId,
            title,
            problemId: problemId || undefined,
            users: [req.user._id]
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create room', error: error.message });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findOne({ roomId }).populate('problemId').populate('users', 'username email');
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Add user to the room if not already in it
        if (!room.users.some(u => u._id.toString() === req.user._id.toString())) {
            room.users.push(req.user._id);
            await room.save();
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch room', error: error.message });
    }
};

exports.getRoomsList = async (req, res) => {
    try {
        const rooms = await Room.find({}).populate('problemId').sort({ createdAt: -1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rooms list', error: error.message });
    }
};
