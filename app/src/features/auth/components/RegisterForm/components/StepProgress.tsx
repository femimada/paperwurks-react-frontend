// src/features/auth/components/RegisterForm/components/StepProgress.tsx
import React from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  labels = [],
  className = '',
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <nav className={`${className}`} aria-label="Registration progress">
      <ol className="flex items-center justify-between">
        {steps.map((step) => (
          <li key={step} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  transition-all duration-300
                  ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
                aria-current={step === currentStep ? 'step' : undefined}
                aria-label={`${labels[step] || `Step ${step + 1}`}: ${
                  step < currentStep
                    ? 'Completed'
                    : step === currentStep
                      ? 'Current'
                      : 'Not started'
                }`}
              >
                {step < currentStep ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span aria-hidden="true">{step + 1}</span>
                )}
              </div>
              {labels[step] && <span className="sr-only">{labels[step]}</span>}
            </div>
            {step < totalSteps - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded-full transition-all duration-300
                  ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
