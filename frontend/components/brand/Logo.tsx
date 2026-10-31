'use client';

import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'icon' | 'full' | 'stacked';
  showTagline?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = '',
  theme = 'auto'
}) => {
  // Dimension mapping
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 20;
      case 'sm':
        return 24;
      case 'md':
        return 32;
      case 'lg':
        return 40;
      case 'xl':
        return 52;
      default:
        return 32;
    }
  };

  const dim = getDimension();

  // SVG Icon Symbol for CONFLUENCE
  // Represents two converging streams of knowledge forming an iconic 'C' monogram
  // with 3 focal nodes: Meetings, Decisions, and Execution Commitments.
  const LogoIcon = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform hover:scale-105 duration-200"
    >
      <defs>
        {/* Obsidian to Cobalt River Gradient */}
        <linearGradient id="streamPrimary" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1c1b1a" />
          <stop offset="55%" stopColor="#2a72de" />
          <stop offset="100%" stopColor="#4f9cf9" />
        </linearGradient>

        {/* Tributary Accent Gradient */}
        <linearGradient id="streamSecondary" x1="40" y1="14" x2="16" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a72de" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#1c1b1a" />
        </linearGradient>

        {/* Ambient Nucleus Glow */}
        <radialGradient id="confluenceGlow" cx="26" cy="24" r="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a72de" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2a72de" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle Ambient Radial Aura */}
      <circle cx="26" cy="24" r="16" fill="url(#confluenceGlow)" />

      {/* Upper Inflow Stream: Arcs smoothly into the main Confluence C-curve */}
      <path
        d="M 38 12 C 28 8, 14 11, 10 24 C 8 35, 20 40, 36 37 C 28 37, 16 34, 15 24 C 14 15, 26 12, 38 12 Z"
        fill="url(#streamPrimary)"
      />

      {/* Converging Knowledge Stream: Bridges the meeting and decision paths */}
      <path
        d="M 39 15 C 31 16, 20 20, 18 24 C 20 28, 31 32, 39 33 C 33 30, 24 26, 24 24 C 24 22, 33 18, 39 15 Z"
        fill="url(#streamSecondary)"
        opacity="0.9"
      />

      {/* Central Memory Nucleus: The locus of ratified decisions */}
      <circle cx="25" cy="24" r="3.2" fill="#2a72de" stroke="#ffffff" strokeWidth="1.75" />

      {/* Tributary Origin Nodes (Meetings & Execution) */}
      <circle cx="37" cy="13.5" r="2.2" fill="#1c1b1a" stroke="#ffffff" strokeWidth="1.25" />
      <circle cx="37" cy="34.5" r="2.2" fill="#1c1b1a" stroke="#ffffff" strokeWidth="1.25" />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
        {LogoIcon}
        <div>
          <span className="font-serif font-bold text-base tracking-[0.22em] text-[#1c1b1a] uppercase leading-none block">
            CONFLUENCE
          </span>
          {showTagline && (
            <span className="text-[9px] uppercase tracking-[0.16em] text-[#838280] font-medium block mt-1">
              Organisational Memory
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default 'full' horizontal variant
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {LogoIcon}
      <div className="flex flex-col">
        <span className="font-serif font-bold text-sm tracking-[0.2em] text-[#1c1b1a] uppercase leading-tight">
          CONFLUENCE
        </span>
        {showTagline && (
          <span className="text-[8px] uppercase tracking-[0.18em] text-[#838280] font-semibold leading-tight">
            Organisational Memory
          </span>
        )}
      </div>
    </div>
  );
};
