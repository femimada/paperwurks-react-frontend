// src/components/auth/AuthHeader.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/shared/components';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'compact';
  showLogo?: boolean;
}

/**
 * AuthHeader component - migrated to shadcn/ui
 * Uses design tokens and improved typography hierarchy
 */
export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'Paperwurks',
  subtitle = 'Property documentation made simple',
  className = '',
  variant = 'default',
  showLogo = true,
}) => {
  const containerClasses = cn(
    'text-center',
    variant === 'compact' ? 'space-y-2' : 'space-y-4',
    className
  );

  return (
    <div className={containerClasses}>
      {showLogo && (
        <div className="flex justify-center">
          <Logo
            size={variant === 'compact' ? 'sm' : 'md'}
            variant="default"
            showText={variant !== 'compact'}
          />
        </div>
      )}

      {title && (
        <div className="space-y-2">
          <h1
            className={cn(
              'font-bold tracking-tight text-foreground',
              variant === 'compact' ? 'text-2xl' : 'text-3xl'
            )}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={cn(
                'text-muted-foreground',
                variant === 'compact' ? 'text-xs' : 'text-sm'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
