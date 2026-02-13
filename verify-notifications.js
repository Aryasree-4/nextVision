const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function verifyNotifications() {
    console.log('--- Starting Notification Verification ---');

    // 1. Test Socket Connection
    const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected successfully:', socket.id);

        // 2. Join a test classroom
        const testClassroomId = '67ab2d67a123bc4567890def'; // Dummy ID for testing
        socket.emit('joinClassroom', testClassroomId);
        console.log('📢 Joined classroom:', testClassroomId);
    });

    socket.on('newNotification', (notification) => {
        console.log('✨ Received real-time notification:', notification.message);
        process.exit(0);
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
        process.exit(1);
    });

    // Timeout for verification
    setTimeout(() => {
        console.error('❌ Verification timed out. No notification received.');
        process.exit(1);
    }, 10000);
}

// Note: This script requires a running server and valid credentials/IDs.
// It's meant as a blueprint for the manual verification steps performed during development.
console.log('Verification script ready. Run with "node verify-notifications.js" while server is active.');
