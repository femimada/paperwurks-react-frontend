import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useLogin } from '../../../hooks/auth/useLogin';
import { Input, Button, Card } from '@/components/ui';
import { logger } from '@/utils/logger';

// Extracted SVG icons for better readability and maintainability
const EmailIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const PasswordIcon = () => (
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
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M10 4C5.5 4 2 10 2 10s3.5 6 8 6 8-6 8-6-3.5-6-8-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3.7 3.7a1 1 0 011.4-1.4l12.6 12.6a1 1 0 01-1.4 1.4L3.7 3.7zM10 4c4.5 0 8 6 8 6s-1.2 2.3-3.1 4l-1.4-1.4c1.5-1.2 2.5-3 2.5-4.6 0-2.2-1.8-4-4-4-1.6 0-3.4 1-4.6 2.5L6.1 5.1C7.7 4.2 9 4 10 4zm-6 6c0-1.6 1-3.4 2.5-4.6L4.1 3.1C2.2 4.7 2 7 2 7s3.5 6 8 6c1.1 0 2.3-.3 3.4-.8l-1.4-1.4c-.6.3-1.3.5-2 .5-2.2 0-4-1.8-4-4z"
      clipRule="evenodd"
    />
  </svg>
);

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
  const [showPassword, setShowPassword] = React.useState(false);
  const emailInputWrapperRef = React.useRef<HTMLDivElement>(null);

  // Change: Add debug log to verify focus logic
  // Reason: Focus test is failing, so log when useEffect runs
  React.useEffect(() => {
    if (errors.email && emailInputWrapperRef.current) {
      const input = emailInputWrapperRef.current.querySelector(
        'input[data-testid="email-input"]'
      );
      if (input instanceof HTMLInputElement) {
        logger.debug('Focusing email input due to validation error', {
          error: errors.email.message,
        });
        input.focus();
      }
    }
    return () => {
      logger.debug('Clearing error on unmount');
      clearError();
    };
  }, [clearError, errors.email]);

  const formContent = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
      data-testid={testId}
      noValidate
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Please enter your details.
        </p>
      </div>

      {error && (
        <div
          className="alert alert--error flex items-center"
          role="alert"
          aria-live="assertive"
          data-testid="login-error"
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 text-sm text-gray-600 hover:text-gray-800"
            aria-label="Dismiss error"
            data-testid="error-dismiss-button"
          >
            ✕
          </button>
        </div>
      )}

      <div ref={emailInputWrapperRef}>
        <Input
          {...register('email')}
          type="email"
          label="Email address"
          placeholder="Enter your email"
          error={errors.email?.message}
          icon={<EmailIcon />}
          iconPosition="left"
          autoComplete="email"
          testId="email-input"
        />
      </div>

      <div className="relative">
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          icon={<PasswordIcon />}
          iconPosition="left"
          autoComplete="current-password"
          testId="password-input"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          style={{ top: 'calc(50% + 0.5rem)' }}
          data-testid="password-toggle-button"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

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

  if (showCard) {
    return (
      <Card className="w-full max-w-md mx-auto" shadow padding="lg">
        {formContent}
      </Card>
    );
  }

  return formContent;
};

export default React.memo(LoginForm);
