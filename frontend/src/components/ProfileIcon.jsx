import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileIcon = ({ size = 'md' }) => {
    const auth = useAuth();
    const user = auth?.user;

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    // If no user is logged in, don't show the icon at all
    if (!user) return null;

    const sClass = sizeClasses[size] || sizeClasses.md;

    // Use a hardcoded fallback character if name matches character charAt
    const initial = (user.name && typeof user.name === 'string') ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <Link
            to="/profile"
            className={`${sClass} rounded-full border-2 border-white/20 hover:border-space-light transition-all flex items-center justify-center overflow-hidden bg-gray-800 shadow-lg group`}
            title="My Profile"
        >
            {user.profilePicture && user.profilePicture !== 'default-profile.png' ? (
                <img
                    src={`http://localhost:5000/uploads/${user.profilePicture}`}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center bg-space-light text-space-dark font-bold uppercase group-hover:bg-white transition-colors ${user.profilePicture && user.profilePicture !== 'default-profile.png' ? 'hidden' : ''}`}>
                {initial}
            </div>
        </Link>
    );
};

export default ProfileIcon;
