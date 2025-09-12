// src/components/auth/AuthCard.tsx
import React from 'react';
import { Card } from '@/components/ui';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent card wrapper for auth forms
 */
export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <Card className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${className}`}>
        {children}
      </Card>
    </div>
  );
};
