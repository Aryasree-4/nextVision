import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentClassroomId, setCurrentClassroomId] = useState(null);

    // Initialize Socket
    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            withCredentials: true,
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Fetch notifications for a classroom
    const fetchNotifications = useCallback(async (classroomId) => {
        try {
            const { data } = await api.get(`/notifications/${classroomId}`);
            setNotifications(data);

            // Calculate unread
            const unread = data.filter(n => !n.readBy.includes(user?._id)).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [user?._id]);

    // Join classroom room
    useEffect(() => {
        if (socket && currentClassroomId) {
            socket.emit('joinClassroom', currentClassroomId);
            fetchNotifications(currentClassroomId);

            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            socket.on('reactionUpdated', ({ notificationId, reactions }) => {
                setNotifications(prev => prev.map(n =>
                    n._id === notificationId ? { ...n, reactions } : n
                ));
            });

            return () => {
                socket.emit('leaveClassroom', currentClassroomId);
                socket.off('newNotification');
                socket.off('reactionUpdated');
            };
        }
    }, [socket, currentClassroomId, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await api.post(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n =>
                n._id === notificationId ? { ...n, readBy: [...n.readBy, user._id] } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const reactToNotification = async (notificationId) => {
        try {
            await api.post(`/notifications/${notificationId}/react`);
            // State will be updated via socket event 'reactionUpdated'
        } catch (error) {
            console.error('Failed to react', error);
        }
    };

    const broadcastNotification = async (classroomId, message, link) => {
        try {
            await api.post('/notifications/broadcast', { classroomId, message, link });
            // Notification will be received via socket 'newNotification'
        } catch (error) {
            console.error('Failed to broadcast', error);
            throw error;
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            setCurrentClassroomId,
            markAsRead,
            reactToNotification,
            broadcastNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
