// src/features/auth/components/LoginForm.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useLogin } from '../hooks/useLogin';
import { Input, Button, Card } from '@/components/ui';

interface LoginFormProps {
  className?: string;
  testId?: string;
  showCard?: boolean;
  showLinks?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  className = '',
  testId,
  showCard = true,
  showLinks = true,
}) => {
  const { error, clearError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    onSubmit,
    isSubmitting,
  } = useLogin();

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const formContent = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
      data-testid={testId}
      noValidate
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Please enter your details.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="alert alert--error"
          role="alert"
          data-testid="login-error"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Email Field */}
      <Input
        {...register('email')}
        type="email"
        label="Email address"
        placeholder="Enter your email"
        error={errors.email?.message}
        icon={
          <svg
            className="h-5 w-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
        iconPosition="left"
        autoComplete="email"
        testId="email-input"
      />

      {/* Password Field */}
      <Input
        {...register('password')}
        type="password"
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        icon={
          <svg
            className="h-5 w-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        }
        iconPosition="left"
        autoComplete="current-password"
        testId="password-input"
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid="remember-me-checkbox"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </div>

        {showLinks && (
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 focus-ring rounded-sm px-1 py-0.5"
            data-testid="forgot-password-link"
          >
            Forgot password?
          </Link>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="base"
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
        className="w-full"
        testId="login-submit-button"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      {/* Register Link */}
      {showLinks && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 font-medium focus-ring rounded-sm px-1 py-0.5"
              data-testid="register-link"
            >
              Create one here
            </Link>
          </p>
        </div>
      )}

      {/* Demo Credentials */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Demo Credentials
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <strong>Owner:</strong> owner@test.com
            </div>
            <div>
              <strong>Agent:</strong> agent@test.com
            </div>
            <div>
              <strong>Solicitor:</strong> solicitor@test.com
            </div>
            <div>
              <strong>Buyer:</strong> buyer@test.com
            </div>
            <div>
              <strong>Password:</strong> password123
            </div>
          </div>
        </div>
      )}
    </form>
  );

  // Wrap in card if requested
  if (showCard) {
    return (
      <Card className="w-full max-w-md mx-auto" shadow padding="lg">
        {formContent}
      </Card>
    );
  }

  return formContent;
};
