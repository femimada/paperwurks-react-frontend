// src/pages/auth/LoginPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthLayout, AuthCard } from '@/components/auth';
import { useAuth } from '@/hooks/auth';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Sign in to Paperwurks"
      subtitle="Welcome back! Enter your credentials to continue."
      testId="login-page"
    >
      <AuthCard>
        <LoginForm showCard={false} />
      </AuthCard>
    </AuthLayout>
  );
};
