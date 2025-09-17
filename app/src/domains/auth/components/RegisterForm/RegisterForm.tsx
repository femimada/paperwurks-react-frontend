// src/features/auth/components/RegisterForm/RegisterForm.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';

import { useRegister } from '@/domains/auth';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { TermsStep } from './steps/TermsStep';
import { StepProgress } from './components/StepProgress';
import { StepNavigation } from './components/StepNavigation';
import {
  Card,
  CardContent,
  CardHeader,
  Alert,
  AlertDescription,
} from '@/shared/components/ui';

interface RegisterFormProps {
  className?: string;
  testId?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  className = '',
  testId = 'register-form',
}) => {
  const registerHook = useRegister();

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

    // Helper data
    roleOptions,
    requiresOrganization,
  } = registerHook;

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

  const stepLabels = ['Personal Info', 'Role Selection', 'Terms & Conditions'];

  return (
    <div className={`max-w-2xl mx-auto ${className}`} data-testid={testId}>
      <Card>
        <CardHeader className="text-center space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Join Paperwurks to streamline your property documentation
            </p>
          </div>

          {/* Progress Indicator */}
          <StepProgress
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            labels={stepLabels}
            className="mt-6"
          />
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {/* Submit Error */}
          {submitError && (
            <Alert
              variant="destructive"
              className="mb-6"
              data-testid="submit-error"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{submitError}</span>
                <button
                  type="button"
                  onClick={clearSubmitError}
                  className="ml-2 p-1 rounded-sm hover:bg-destructive/20 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
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
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:underline"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
