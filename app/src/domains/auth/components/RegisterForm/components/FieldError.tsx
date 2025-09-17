// src/features/auth/components/RegisterForm/components/FieldError.tsx
import React from 'react';
import type { FieldError as FieldErrorType } from 'react-hook-form';

interface FieldErrorProps {
  error?: FieldErrorType;
  id?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  id,
  className = '',
}) => {
  if (!error?.message) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={`mt-1 text-sm text-red-600 flex items-start ${className}`}
    >
      <svg
        className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error.message}</span>
    </div>
  );
};
