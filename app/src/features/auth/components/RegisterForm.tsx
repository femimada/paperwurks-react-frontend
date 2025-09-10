// src/features/auth/components/RegisterForm.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useRegister } from '../hooks/useRegister';
import { Input, Button, Card } from '@/components/ui';

interface RegisterFormProps {
  className?: string;
  testId?: string;
  showCard?: boolean;
  showLinks?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = '',
  testId,
  showCard = true,
  showLinks = true,
}) => {
  const { error, clearError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    onSubmit,
    isSubmitting,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    canProceed,
    nextStep,
    prevStep,
    roleOptions,
    requiresOrganization,
    passwordStrength,
    setValue,
    watch,
  } = useRegister();

  const watchedValues = watch();

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4 mb-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              index < currentStepIndex
                ? 'bg-green-500 text-white'
                : index === currentStepIndex
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index < currentStepIndex ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              index + 1
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600">
        Step {currentStepIndex + 1} of {totalSteps}
      </div>
    </div>
  );

  // Personal information step
  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Let's start with your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="First Name"
          placeholder="Enter your first name"
          error={errors.firstName?.message}
          testId="firstName-input"
        />

        <Input
          {...register('lastName')}
          label="Last Name"
          placeholder="Enter your last name"
          error={errors.lastName?.message}
          testId="lastName-input"
        />
      </div>

      <Input
        {...register('email')}
        type="email"
        label="Email Address"
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

      <div className="space-y-4">
        <Input
          {...register('password')}
          type="password"
          label="Password"
          placeholder="Create a secure password"
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
          autoComplete="new-password"
          testId="password-input"
        />

        {/* Password strength indicator */}
        {watchedValues.password && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    passwordStrength.score < 2
                      ? 'bg-red-500'
                      : passwordStrength.score < 4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {passwordStrength.score < 2
                  ? 'Weak'
                  : passwordStrength.score < 4
                    ? 'Medium'
                    : 'Strong'}
              </span>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Missing: {passwordStrength.feedback.join(', ')}
              </p>
            )}
          </div>
        )}

        <Input
          {...register('confirmPassword')}
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
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
          autoComplete="new-password"
          testId="confirmPassword-input"
        />
      </div>
    </div>
  );

  // Role selection step
  const RoleSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Role</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select the role that best describes you
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roleOptions.map((option) => (
          <div
            key={option.value}
            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${
              watchedValues.role === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setValue('role', option.value)}
          >
            <div className="flex items-center">
              <input
                {...register('role')}
                type="radio"
                value={option.value}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                data-testid={`role-${option.value}`}
              />
              <div className="ml-3">
                <label className="font-medium text-gray-900 cursor-pointer">
                  {option.label}
                </label>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {errors.role && (
        <div className="text-red-600 text-sm mt-2">{errors.role.message}</div>
      )}
    </div>
  );

  // Terms and organization step
  const TermsAndOrgStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Complete Registration
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Final details to create your account
        </p>
      </div>

      {requiresOrganization && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Organization Information
          </h3>

          <Input
            {...register('organizationName')}
            label="Organization Name"
            placeholder="Enter your company name"
            error={errors.organizationName?.message}
            testId="organizationName-input"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Organization Type
            </label>
            <select
              {...register('organizationType')}
              className="form-input"
              data-testid="organizationType-select"
            >
              <option value="">Select type...</option>
              <option value="estate_agency">Estate Agency</option>
              <option value="law_firm">Law Firm</option>
              <option value="property_company">Property Company</option>
            </select>
            {errors.organizationType && (
              <div className="text-red-600 text-sm">
                {errors.organizationType.message}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start">
          <input
            {...register('acceptsTerms')}
            type="checkbox"
            className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid="acceptsTerms-checkbox"
          />
          <label className="ml-2 text-sm text-gray-900">
            I accept the{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.acceptsTerms && (
          <div className="text-red-600 text-sm">
            {errors.acceptsTerms.message}
          </div>
        )}

        <div className="flex items-start">
          <input
            {...register('acceptsMarketing')}
            type="checkbox"
            className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-testid="acceptsMarketing-checkbox"
          />
          <label className="ml-2 text-sm text-gray-900">
            I would like to receive marketing emails and updates
          </label>
        </div>
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return <PersonalInfoStep />;
      case 'role':
        return <RoleSelectionStep />;
      case 'terms':
        return <TermsAndOrgStep />;
      default:
        return null;
    }
  };

  const formContent = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
      data-testid={testId}
      noValidate
    >
      <ProgressIndicator />

      {/* Error Display */}
      {error && (
        <div
          className="alert alert--error"
          role="alert"
          data-testid="register-error"
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

      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        {!isFirstStep ? (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            data-testid="prev-step-button"
          >
            ← Previous
          </Button>
        ) : (
          <div />
        )}

        {!isLastStep ? (
          <Button
            type="button"
            variant="primary"
            onClick={nextStep}
            disabled={!canProceed}
            data-testid="next-step-button"
          >
            Continue →
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!canProceed || isSubmitting}
            data-testid="register-submit-button"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        )}
      </div>

      {/* Login Link */}
      {showLinks && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium focus-ring rounded-sm px-1 py-0.5"
              data-testid="login-link"
            >
              Sign in here
            </Link>
          </p>
        </div>
      )}
    </form>
  );

  // Wrap in card if requested
  if (showCard) {
    return (
      <Card className="w-full max-w-2xl mx-auto" shadow padding="lg">
        {formContent}
      </Card>
    );
  }

  return formContent;
};
