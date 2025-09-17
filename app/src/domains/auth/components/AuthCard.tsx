// src/components/auth/AuthCard.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';

interface AuthCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'elevated' | 'minimal';
  testId?: string;
}

/**
 * AuthCard component - shadcn/ui Card wrapper for auth forms
 * Provides consistent card styling for authentication pages
 */
export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  description,
  className = '',
  variant = 'default',
  testId,
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-6', className)} data-testid={testId}>
        {(title || description) && (
          <div className="space-y-2 text-center">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        variant === 'elevated' && 'shadow-lg border-border/50',
        className
      )}
      data-testid={testId}
    >
      {(title || description) && (
        <CardHeader className="space-y-1 text-center">
          {title && <CardTitle className="text-xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className={cn(title || description ? 'pt-0' : 'pt-6')}>
        {children}
      </CardContent>
    </Card>
  );
};
