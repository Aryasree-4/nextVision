import React from 'react';

const GlassCard = ({ children, className = '', hover = true }) => {
    return (
        <div className={`glass-panel ${hover ? 'glass-panel-hover' : ''} ${className}`}>
            {children}
        </div>
    );
};

export default GlassCard;
