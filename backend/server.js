const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: (origin, callback) => callback(null, true), // Allow everything for debug
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'supersecret',
        resave: false,
        saveUninitialized: false, // Don't create session until something stored
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions',
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes'); // Added course routes
const classroomRoutes = require('./routes/classroomRoutes');
const userRoutes = require('./routes/userRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); // Added course routes
app.use('/api/classrooms', classroomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Added static file serving

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const http = require('http');
const server = http.createServer(app);

// Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        credentials: true,
    }
});

// Make io globally accessible
global.io = io;

io.on('connection', (socket) => {
    console.log('New Socket Connection:', socket.id);

    // Join classroom room
    socket.on('joinClassroom', (classroomId) => {
        socket.join(classroomId);
        console.log(`Socket ${socket.id} joined classroom: ${classroomId}`);
    });

    socket.on('leaveClassroom', (classroomId) => {
        socket.leave(classroomId);
        console.log(`Socket ${socket.id} left classroom: ${classroomId}`);
    });

    socket.on('disconnect', () => {
        console.log('Socket Disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
