// src/features/auth/components/RegisterForm/RegisterForm.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import { useRegister, useAuth } from '@/domains/auth';
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
  const { error, clearError } = useAuth();
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

  useEffect(() => {
    if (error && prevStepRef.current !== currentStep) {
      clearError();
    }
  }, [currentStep, error, clearError]);

  const handleNextStep = async () => {
    const success = await nextStep();
    if (!success) {
      scrollToFirstError();
    }
  };

  const stepLabels = ['Personal Info', 'Role Selection', 'Terms & Conditions'];

  const formContent = (
    <div className={`space-y-8 ${className}`} data-testid={testId}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Registration failed</div>
            <div className="mt-1">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Progress */}
      <StepProgress
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        labels={Object.values(stepLabels)}
      />

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step Content */}
        <div className="min-h-[400px]">
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

      {/* Links */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/90 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Create Your Account
        </h1>
        <p className="text-muted-foreground">
          Join Paperwurks to streamline your property transactions
        </p>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};
