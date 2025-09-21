// src/features/auth/components/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth, useLogin } from '@/domains/auth/hooks';

import {
  Button,
  Input,
  Checkbox,
  Alert,
  AlertDescription,
  Card,
} from '@/shared/components/ui';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
  testId?: string;
  showCard?: boolean;
  showLinks?: boolean;
  variant?: 'default' | 'compact';
}

/**
 * LoginForm component - migrated to shadcn/ui
 * Preserves all original functionality while using design tokens and shadcn components
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  className = '',
  testId = 'login-form',
  showCard = true,
  showLinks = true,
}) => {
  const { error, clearError, isLoading } = useAuth();
  const { onSubmit, isSubmitting, form } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isValid },
  } = form;

  // Auto-focus email input on mount
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  // Focus management for validation errors
  useEffect(() => {
    if (errors.email) {
      setFocus('email');
    } else if (errors.password) {
      setFocus('password');
    }
  }, [errors.email, errors.password, setFocus]);

  // Clear auth error on unmount only
  useEffect(() => {
    return () => {
      clearError(); // Always clear on unmount, regardless of current error state
    };
  }, [clearError]); // Remove 'error' from dependencies

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formContent = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
      data-testid={testId}
      noValidate
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back! Please enter your details.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error ||
              'Login failed. Please check your credentials and try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10"
            disabled={isSubmitting || isLoading}
            data-testid="email-input"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="pl-10 pr-10"
            disabled={isSubmitting || isLoading}
            data-testid="password-input"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            disabled={isSubmitting}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            data-testid="password-toggle-button"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            {...register('rememberMe')}
            disabled={isSubmitting}
            data-testid="remember-me-checkbox"
          />
          <label htmlFor="rememberMe" className="text-sm text-foreground">
            Remember me
          </label>
        </div>
        {showLinks && (
          <Link
            to="/auth/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            data-testid="forgot-password-link"
          >
            Forgot password?
          </Link>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isLoading || !isValid} // Use both loading states
        data-testid="login-submit-button"
      >
        {isSubmitting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      {/* Register Link */}
      {showLinks && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
              data-testid="register-link"
            >
              Create one here
            </Link>
          </p>
        </div>
      )}

      {/* Demo Credentials */}
      {(process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test') && (
        <div
          className="mt-6 p-4 bg-secondary rounded-md"
          data-testid="demo-credentials"
        >
          <h4 className="text-sm font-medium text-foreground mb-2">
            Demo Credentials
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
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

  if (showCard) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6">{formContent}</div>
      </Card>
    );
  }

  return formContent;
};
