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
}) => {
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

  // Clean, solid black vector logo mark (Transparent background)
  // Two fluid streams converging into an iconic 'C' monogram with a central memory nucleus.
  const LogoIcon = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform hover:scale-105 duration-200"
    >
      {/* Outer convergent stream */}
      <path
        d="M 38 12 C 28 8, 14 11, 10 24 C 8 35, 20 40, 36 37 C 28 37, 16 34, 15 24 C 14 15, 26 12, 38 12 Z"
        fill="#000000"
      />
      {/* Inner flowing confluence streamline */}
      <path
        d="M 39 15.5 C 31 16.5, 20 20.5, 18 24 C 20 27.5, 31 31.5, 39 32.5 C 33 29.5, 24 26, 24 24 C 24 22, 33 18.5, 39 15.5 Z"
        fill="#000000"
      />
      {/* Central nucleus */}
      <circle cx="25" cy="24" r="3.2" fill="#000000" />
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
          <span className="font-serif font-bold text-base tracking-[0.22em] text-[#000000] uppercase leading-none block">
            CONFLUENCE
          </span>
          {showTagline && (
            <span className="text-[9px] uppercase tracking-[0.16em] text-[#666666] font-medium block mt-1">
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
        <span className="font-serif font-bold text-sm tracking-[0.2em] text-[#000000] uppercase leading-tight">
          CONFLUENCE
        </span>
        {showTagline && (
          <span className="text-[8px] uppercase tracking-[0.18em] text-[#666666] font-semibold leading-tight">
            Organisational Memory
          </span>
        )}
      </div>
    </div>
  );
};
