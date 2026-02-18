import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfileIcon = ({ size = 'md' }) => {
    const auth = useAuth();
    const user = auth?.user;
    const [imgError, setImgError] = useState(false);

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
            className={`${sClass} rounded-full border border-white/10 hover:border-space-accent transition-all duration-500 flex items-center justify-center overflow-hidden bg-black/40 shadow-[0_0_20px_rgba(0,0,0,0.5)] group relative`}
            title="Profile"
        >
            <div className="absolute inset-0 bg-space-accent/5 group-hover:bg-space-accent/10 transition-colors"></div>
            {user.profilePicture && user.profilePicture !== 'default-profile.png' && !imgError ? (
                <img
                    src={`http://localhost:5000/uploads/${user.profilePicture}`}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-10"
                    onError={() => setImgError(true)}
                />
            ) : null}
            {(!user.profilePicture || user.profilePicture === 'default-profile.png' || imgError) && (
                <div className="w-full h-full flex items-center justify-center bg-space-accent/20 text-space-accent font-black uppercase tracking-tighter group-hover:bg-space-accent group-hover:text-black transition-all duration-500 relative z-10">
                    {initial}
                </div>
            )}
        </Link>
    );
};

export default ProfileIcon;
