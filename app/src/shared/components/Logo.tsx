// src/components/common/Logo.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'monochrome';
  className?: string;
  showText?: boolean;
  textClassName?: string;
  href?: string;
}

const sizeClasses = {
  xs: { icon: 'h-6 w-6', text: 'text-lg' },
  sm: { icon: 'h-8 w-8', text: 'text-xl' },
  md: { icon: 'h-12 w-12', text: 'text-2xl' },
  lg: { icon: 'h-16 w-16', text: 'text-3xl' },
  xl: { icon: 'h-20 w-20', text: 'text-4xl' },
};

/**
 * Paperwurks logo component - migrated to shadcn/ui
 * Uses proper design tokens, consistent sizing, and flexible variants
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  showText = false,
  textClassName = '',
  href,
}) => {
  const { icon: iconSize, text: textSize } = sizeClasses[size];

  const iconClasses = cn(
    iconSize,
    variant === 'default' ? 'text-primary' : 'text-current',
    className
  );

  const textClasses = cn(
    'font-bold',
    textSize,
    variant === 'default' ? 'text-foreground' : 'text-current',
    textClassName
  );

  const LogoSvg = () => (
    <svg
      className={iconClasses}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Paperwurks logo"
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
  );

  const LogoContent = () => (
    <div className={cn('flex items-center', showText && 'gap-3')}>
      <LogoSvg />
      {showText && <span className={textClasses}>Paperwurks</span>}
    </div>
  );

  // If href is provided, wrap in a link
  if (href) {
    return (
      <a
        href={href}
        className="inline-flex items-center transition-opacity hover:opacity-80"
        aria-label={showText ? undefined : 'Paperwurks'}
      >
        <LogoContent />
      </a>
    );
  }

  return <LogoContent />;
};
