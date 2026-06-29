// index.js
const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./database/db.js');
const authRoutes = require('./routes/authRoutes.js');
const problemRoutes = require('./routes/problemRoutes.js');
const submissionRoutes = require('./routes/submissionRoutes.js');
const aiRoutes = require('./routes/aiRoutes.js');
const roomRoutes = require('./routes/roomRoutes.js');
const interviewRoutes = require('./routes/interviewRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite dev server URL
    credentials: true,
}));
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(cookieParser()); // To parse cookies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);

// Simple root route
app.get('/', (req, res) => {
    res.send('AlgoNest API is running...');
});

// Create HTTP server and bind Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
});

// Initialize Socket.io connection handlers
require('./socket/socketHandler.js')(io);

// Expose io on app so we can use it in our routes/controllers
app.set('io', io);

// Initialize Queue events listener
require('./queue/submissionWorkerEvents.js')(app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));