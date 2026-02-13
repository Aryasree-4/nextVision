import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const NotificationBoard = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, reactToNotification } = useNotifications();
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-space-blue/95 backdrop-blur-xl border-l border-white/10 z-[100] shadow-2xl flex flex-col animate-slide-in">
            <header className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-yellow-400">🔔</span> Classroom Feed
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                    ✕
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic">
                        No updates yet. Stay tuned!
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const isRead = notification.readBy.includes(user?._id);
                        const hasReacted = notification.reactions.some(r => r.user === user?._id);

                        return (
                            <div
                                key={notification._id}
                                className={`p-4 rounded-xl border transition-all duration-300 ${isRead ? 'bg-white/5 border-white/5' : 'bg-white/10 border-space-light/30 shadow-lg shadow-space-light/5'
                                    }`}
                                onMouseEnter={() => !isRead && markAsRead(notification._id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                        {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                    {!isRead && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    )}
                                </div>

                                <p className="text-white text-sm leading-relaxed mb-3">
                                    {notification.message}
                                </p>

                                {notification.link && (
                                    <a
                                        href={notification.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mb-3 p-2 bg-space-light/20 border border-space-light/30 rounded text-xs text-space-light hover:bg-space-light/30 transition text-center font-medium"
                                    >
                                        🔗 Join Activity / Open Link
                                    </a>
                                )}

                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => reactToNotification(notification._id)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${hasReacted ? 'bg-space-light text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            👍
                                        </button>
                                        <span className="text-xs text-gray-500">
                                            {notification.reactions.length}
                                        </span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {notification.reactions.slice(0, 3).map((r, i) => (
                                            <div key={i} className="w-5 h-5 rounded-full bg-gray-700 border border-space-blue flex items-center justify-center text-[8px]">
                                                👤
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <footer className="p-4 border-t border-white/10 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Real-time Classroom Updates</p>
            </footer>
        </div>
    );
};

export default NotificationBoard;
