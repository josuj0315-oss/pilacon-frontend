import React from 'react';

const PilatesTeaserLogo = ({ size = 100, color = "#5b5ff5", className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
    >
        {/* Refined Teaser Pose Silhouette */}
        <g transform="translate(15, 15) scale(0.7)">
            {/* Head */}
            <circle cx="78" cy="18" r="8" fill={color} />

            {/* Torso & Sits-bones balance point */}
            <path
                d="M68 28C62 30 55 35 48 45C42 55 45 65 50 70C55 75 65 72 70 65C75 58 78 45 78 35"
                fill={color}
            />

            {/* Legs (straight V shape) */}
            <path
                d="M48 68C48 68 35 60 20 45C5 30 2 20 2 15C2 10 8 8 12 12C15 15 35 45 45 60L48 68Z"
                fill={color}
            />

            {/* Arms (reaching parallel to legs) */}
            <path
                d="M72 38C72 38 60 40 45 35C30 30 25 25 25 20C25 17 30 15 32 18C35 22 55 35 68 40L72 38Z"
                fill={color}
            />
        </g>
    </svg>
);

export default PilatesTeaserLogo;
