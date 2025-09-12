// src/features/auth/components/RegisterForm/RegisterForm.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../../../hooks/auth/useRegister';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { TermsStep } from './steps/TermsStep';
import { StepProgress } from './components/StepProgress';
import { StepNavigation } from './components/StepNavigation';
import { Card } from '@/components/ui';

interface RegisterFormProps {
  className?: string;
  testId?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = '',
  testId = 'register-form',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,

    // Step management
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,

    // Navigation
    nextStep,
    prevStep,

    // Validation
    isStepValid,
    scrollToFirstError,

    // Submission
    onSubmit,
    isSubmitting,
    submitError,
    clearSubmitError,
    submitAttempts,

    // Helper data
    roleOptions,
    requiresOrganization,
  } = useRegister();

  const prevStepRef = useRef(currentStep);

  // Focus management when step changes
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      // Step has changed, focus first input
      const firstInput = document.querySelector<HTMLInputElement>(
        `[data-step="${currentStep}"] input:not([type="hidden"]):not([disabled])`
      );
      if (firstInput) {
        firstInput.focus();
      }
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  // Only clear submit error when user navigates to a different step
  useEffect(() => {
    if (submitError && prevStepRef.current !== currentStep) {
      clearSubmitError();
    }
  }, [currentStep, submitError, clearSubmitError]);

  const handleNextStep = async () => {
    const success = await nextStep();
    if (!success) {
      scrollToFirstError();
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`} data-testid={testId}>
      <Card className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">
            Join Paperwurks to streamline your property documentation
          </p>
        </div>

        {/* Progress Indicator */}
        <StepProgress
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          className="mb-8"
          labels={['Personal Info', 'Role Selection', 'Terms & Conditions']}
        />

        {/* Error Alert */}
        {submitError && (
          <div
            className="alert alert--error mb-6"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Registration failed
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {submitError}
                  {submitAttempts > 1 && (
                    <span className="block mt-1 text-xs">
                      Attempt {submitAttempts} - Please try again
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={clearSubmitError}
                className="ml-3 inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                aria-label="Dismiss error message"
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Form - Single source of truth for submission */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step Content */}
          <div className="mb-8" data-step={currentStep}>
            {currentStep === 'personal' && (
              <PersonalInfoStep
                register={register}
                errors={errors}
                watch={watch}
              />
            )}

            {currentStep === 'role' && (
              <RoleSelectionStep
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                roleOptions={roleOptions}
                requiresOrganization={requiresOrganization}
              />
            )}

            {currentStep === 'terms' && (
              <TermsStep register={register} errors={errors} watch={watch} />
            )}
          </div>

          {/* Navigation */}
          <StepNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
            canProceed={isStepValid(currentStep)}
            onNext={handleNextStep}
            onPrev={prevStep}
          />
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
          >
            Sign in instead
          </Link>
        </div>
      </Card>
    </div>
  );
};
