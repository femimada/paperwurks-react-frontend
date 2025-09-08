import React from 'react';
import type { InputProps } from '@/types/ui/component.types';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  testId,
  ...props
}) => {
  const hasError = Boolean(error);
  const inputClasses = [
    'form-input',
    hasError ? 'form-input--error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputId =
    props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          {...props}
          id={inputId}
          className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''}`}
          data-testid={testId}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-help`
                : undefined
          }
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <div id={`${inputId}-error`} className="form-error">
          {error}
        </div>
      )}

      {helperText && !error && (
        <div id={`${inputId}-help`} className="form-help">
          {helperText}
        </div>
      )}
    </div>
  );
};
