// src/pages/auth/RegisterPage.tsx (updated)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { RegisterForm } from '@/domains/auth/components/RegisterForm';
import { AuthLayout, AuthCard } from '@/domains/auth/components';
import { useAuth } from '@/domains/auth/hooks';

export const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title="Join Paperwurks"
      subtitle="Create your account to get started with property documentation"
      testId="register-page"
    >
      <AuthCard>
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
};
