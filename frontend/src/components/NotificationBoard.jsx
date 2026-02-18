import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const NotificationBoard = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, reactToNotification } = useNotifications();
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-black/40 backdrop-blur-3xl border-l border-white/10 z-[100] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-slide-in font-body">
            <header className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex flex-col">
                    <h2 className="text-xs font-black text-white flex items-center gap-3 uppercase tracking-[0.2em]">
                        <span className="text-space-accent animate-pulse">📡</span> Intelligence Feed
                    </h2>
                    <p className="text-[9px] text-gray-500 mt-2 font-black uppercase tracking-widest leading-none">Sector Activity Log</p>
                </div>
                <button
                    onClick={onClose}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all text-xs font-black"
                >
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
                                className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden group ${isRead
                                    ? 'bg-white/2 border-white/5 opacity-60'
                                    : 'bg-white/5 border-space-accent/30 shadow-[0_0_20px_rgba(0,240,255,0.05)]'
                                    }`}
                                onMouseEnter={() => !isRead && markAsRead(notification._id)}
                            >
                                {!isRead && <div className="absolute top-0 left-0 w-1 h-full bg-space-accent shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>}

                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                        {format(new Date(notification.createdAt), 'MMM dd // HH:mm')}
                                    </span>
                                    {!isRead && (
                                        <span className="flex h-2 w-2 rounded-full bg-space-accent animate-pulse ring-4 ring-space-accent/20"></span>
                                    )}
                                </div>

                                <p className="text-gray-300 text-xs font-medium leading-relaxed mb-4 group-hover:text-white transition-colors">
                                    {notification.message}
                                </p>

                                {notification.link && (
                                    <a
                                        href={notification.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mb-4 p-3 bg-space-accent/10 border border-space-accent/20 rounded-xl text-[10px] text-space-accent hover:bg-space-accent/20 transition-all text-center font-black uppercase tracking-widest shadow-inner"
                                    >
                                        Initiate Link Protocol
                                    </a>
                                )}

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => reactToNotification(notification._id)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${hasReacted
                                                ? 'bg-space-accent text-black scale-105 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'
                                                }`}
                                        >
                                            👍
                                        </button>
                                        <span className="text-[10px] font-black font-mono text-gray-500">
                                            {notification.reactions.length.toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div className="flex -space-x-3">
                                        {notification.reactions.slice(0, 3).map((r, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-900 border-2 border-black flex items-center justify-center text-[10px] shadow-lg">
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

            <footer className="p-6 border-t border-white/10 text-center bg-white/5">
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em]">Operational Integrity // Verified Feed</p>
            </footer>
        </div>
    );
};

export default NotificationBoard;
