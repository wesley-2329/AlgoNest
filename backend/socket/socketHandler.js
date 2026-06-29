const Room = require('../models/Room.js');
const Interview = require('../models/Interview.js');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join user room for private updates (like verdicts)
        socket.on('join-user', ({ userId }) => {
            socket.join(`user-${userId}`);
            console.log(`User socket ${socket.id} joined user-${userId}`);
        });

        // Join room/interview session
        socket.on('join-room', async ({ roomId, userId, username }) => {
            socket.join(roomId);
            console.log(`User ${username} (${userId}) joined room: ${roomId}`);

            // Broadcast user joined
            socket.to(roomId).emit('user-joined', { userId, username });
        });

        // Sync Yjs updates for text synchronization
        socket.on('yjs-update', ({ roomId, update }) => {
            // update is a binary buffer
            socket.to(roomId).emit('yjs-update', update);
        });

        // Fallback simple real-time code updates
        socket.on('code-change', async ({ roomId, code, language }) => {
            socket.to(roomId).emit('code-change', { code, language });

            // Persist the code occasionally
            try {
                if (roomId.startsWith('room-')) {
                    await Room.findOneAndUpdate({ roomId }, { code, language });
                } else if (roomId.startsWith('interview-')) {
                    await Interview.findOneAndUpdate({ sessionId: roomId }, { code, language });
                }
            } catch (err) {
                console.error('Failed to auto-save code:', err.message);
            }
        });

        // Cursor synchronization
        socket.on('cursor-move', ({ roomId, cursor, username }) => {
            socket.to(roomId).emit('cursor-move', { cursor, username, socketId: socket.id });
        });

        // Text chat in pair programming
        socket.on('send-message', async ({ roomId, username, message }) => {
            const chatMsg = { username, message, timestamp: new Date() };
            io.in(roomId).emit('receive-message', chatMsg);

            // Persist chat to Room if it's a pair room
            try {
                if (roomId.startsWith('room-')) {
                    await Room.findOneAndUpdate(
                        { roomId },
                        { $push: { chat: chatMsg } }
                    );
                }
            } catch (err) {
                console.error('Failed to save chat message:', err.message);
            }
        });

        // Interview mode events
        socket.on('interview-lock-change', async ({ sessionId, isLocked }) => {
            socket.to(sessionId).emit('interview-lock-change', { isLocked });
            try {
                await Interview.findOneAndUpdate({ sessionId }, { isLocked });
            } catch (err) {
                console.error('Failed to update lock:', err.message);
            }
        });

        socket.on('interview-reveal-hint', async ({ sessionId, hintIndex }) => {
            socket.to(sessionId).emit('interview-reveal-hint', { hintIndex });
            try {
                await Interview.findOneAndUpdate(
                    { sessionId },
                    { $addToSet: { hintsRevealed: hintIndex } }
                );
            } catch (err) {
                console.error('Failed to save revealed hint:', err.message);
            }
        });

        socket.on('interview-change-problem', async ({ sessionId, problemId }) => {
            io.in(sessionId).emit('interview-change-problem', { problemId });
            try {
                await Interview.findOneAndUpdate({ sessionId }, { problemId });
            } catch (err) {
                console.error('Failed to change problem:', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
