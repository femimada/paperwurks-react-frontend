// Update src/components/auth/AuthHeader.tsx
import React from 'react';
import { Logo } from '@/components/common';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Reusable header component for auth pages
 * Displays logo, title, and subtitle
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'Paperwurks',
  subtitle = 'Property documentation made simple',
  className = '',
}) => {
  return (
    <div className={`sm:mx-auto sm:w-full sm:max-w-md ${className}`}>
      {/* Logo */}
      <div className="flex justify-center">
        <Logo size="md" className="text-blue-600" />
      </div>

      {title && (
        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};
