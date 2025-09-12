// src/components/common/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Paperwurks logo component
 * Reusable across the application with different sizes and configurations
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  color = 'currentColor',
  showText = false,
  textClassName = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  return (
    <div className={showText ? 'flex items-center gap-3' : ''}>
      <svg
        className={`${sizeClass} ${className}`}
        fill="none"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Paperwurks logo"
        style={{ color }}
      >
        <g clipPath="url(#paperwurks-logo-clip)">
          <path
            clipRule="evenodd"
            d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </g>
        <defs>
          <clipPath id="paperwurks-logo-clip">
            <rect fill="white" height="48" width="48" />
          </clipPath>
        </defs>
      </svg>
      {showText && (
        <span className={`font-bold ${textSizeClass} ${textClassName}`}>
          Paperwurks
        </span>
      )}
    </div>
  );
};
