// src/components/auth/AuthLayout.tsx
import React from 'react';
import { AuthHeader } from './AuthHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  testId?: string;
}

/**
 * Shared layout component for authentication pages
 * Provides consistent styling and structure across all auth pages
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  testId,
}) => {
  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      data-testid={testId}
    >
      {showLogo && <AuthHeader title={title} subtitle={subtitle} />}
      {children}
    </div>
  );
};
