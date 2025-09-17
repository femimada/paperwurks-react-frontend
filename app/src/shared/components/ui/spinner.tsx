import React, { type ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}
export type ComponentSize = 'sm' | 'base' | 'lg' | 'xl';

export interface SpinnerProps extends BaseComponentProps {
  size?: ComponentSize;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'base',
  color = 'currentColor',
  className = '',
  testId,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    base: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const spinnerClasses = ['spinner', sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={spinnerClasses}
      viewBox="0 0 24 24"
      fill="none"
      data-testid={testId}
      style={{ color }}
    >
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
  );
};
