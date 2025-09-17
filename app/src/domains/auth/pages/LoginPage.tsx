// src/pages/auth/LoginPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/domains/auth/components/LoginForm';
import { AuthLayout, AuthCard } from '@/domains/auth/components';
import { useAuth } from '@/domains/auth/hooks';

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
      variant="default"
      maxWidth="sm"
    >
      <AuthCard variant="default" testId="login-card">
        <LoginForm showCard={false} showLinks={true} variant="default" />
      </AuthCard>
    </AuthLayout>
  );
};
