import React from 'react';

const SkeletonScreen = ({ className = '', type = 'rect' }) => {
    const baseClasses = "bg-white/5 animate-pulse";
    const typeClasses = type === 'circle' ? 'rounded-full' : 'rounded-xl';

    return (
        <div className={`${baseClasses} ${typeClasses} ${className}`} />
    );
};

export default SkeletonScreen;
