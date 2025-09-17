// src/components/auth/AuthLayout.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { AuthHeader } from './AuthHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  variant?: 'default' | 'centered' | 'minimal';
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
}

/**
 * AuthLayout component - migrated to shadcn/ui
 * Provides consistent styling using design tokens
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  variant = 'default',
  maxWidth = 'sm',
  className = '',
  testId,
}) => {
  const containerClasses = cn(
    'min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8',
    variant === 'centered' && 'items-center',
    className
  );

  const contentClasses = cn(
    'w-full mx-auto',
    maxWidth === 'sm' && 'max-w-md',
    maxWidth === 'md' && 'max-w-lg',
    maxWidth === 'lg' && 'max-w-2xl'
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className={contentClasses}>
        {showLogo && !variant.includes('minimal') && (
          <AuthHeader title={title} subtitle={subtitle} />
        )}

        <div
          className={cn(variant === 'minimal' ? 'mt-0' : 'mt-8', 'space-y-6')}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
