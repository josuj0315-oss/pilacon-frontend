import React from 'react';

const PilaconLogo = ({ size = 100, className = "" }) => (
    <div
        className={`pilacon-logo-container ${className}`}
        style={{
            width: size,
            height: size,
            background: '#5b5ff5',
            borderRadius: size * 0.28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(91, 95, 245, 0.25)',
            overflow: 'hidden'
        }}
    >
        <svg
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer Circle (Unfinished at top) */}
            <path
                d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15ZM50 22C65.46 22 78 34.54 78 50C78 65.46 65.46 78 50 78C34.54 78 22 65.46 22 50C22 34.54 34.46 22 50 22Z"
                fill="white"
            />

            {/* Small dot at the top center gap */}
            <circle cx="50" cy="28" r="4" fill="white" />

            {/* The Central "Cone/Shield" shape */}
            <path
                d="M50 42C56 42 63 45 63 52C63 56 60 62 50 72C40 62 37 56 37 52C37 45 44 42 50 42Z"
                fill="white"
            />

            {/* Horizontal divider/bar below the dot */}
            <rect x="42" y="38" width="16" height="3" rx="1.5" fill="white" />
        </svg>
    </div>
);

export default PilaconLogo;
