import React from 'react';
import type { ButtonProps } from '@/types/ui/component.types';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'base',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  testId,
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const loadingClasses = loading ? 'opacity-75 cursor-not-allowed' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    loadingClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={combinedClasses}
      disabled={isDisabled}
      data-testid={testId}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && icon && iconPosition === 'left' && icon}

      {children}

      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};
