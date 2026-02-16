import React from 'react';

const Logo = ({ className = "h-8 w-auto", iconOnly = false }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Futuristic "N" Symbol with Portal/Forward Movement */}
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-auto flex-shrink-0"
            >
                <path
                    d="M4 18L4 6L8 6L14 14L14 6L18 6L18 18L14 18L8 10L8 18L4 18Z"
                    fill="currentColor"
                />
                {/* Abstract Portal/Beam Element */}
                <path
                    d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeOpacity="0.3"
                />
                <path
                    d="M12 4C16.4183 4 20 7.58172 20 12"
                    stroke="url(#logo-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="logo-gradient" x1="12" y1="4" x2="20" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
            </svg>

            {!iconOnly && (
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                    Next<span className="text-space-light">Vision</span>
                </span>
            )}
        </div>
    );
};

export default Logo;
