// src/features/auth/components/RegisterForm/components/StepProgress.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <nav className={cn('w-full', className)} aria-label="Registration progress">
      <ol className="flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <li key={step} className="flex items-center flex-1">
              <div className="flex items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300',
                    {
                      'bg-primary text-primary-foreground':
                        isCompleted || isCurrent,
                      'bg-muted text-muted-foreground': isUpcoming,
                    }
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${labels[step] || `Step ${step + 1}`}: ${
                    isCompleted
                      ? 'Completed'
                      : isCurrent
                        ? 'Current'
                        : 'Not started'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">{step + 1}</span>
                  )}
                </div>

                {/* Step Label (Screen Readers Only) */}
                {labels[step] && (
                  <span className="sr-only">{labels[step]}</span>
                )}
              </div>

              {/* Connector Line */}
              {step < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-4 rounded-full transition-all duration-300',
                    {
                      'bg-primary': step < currentStep,
                      'bg-muted': step >= currentStep,
                    }
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step Labels (Visible) */}
      {labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn('text-xs text-center px-2 transition-colors', {
                'text-primary font-medium': index <= currentStep,
                'text-muted-foreground': index > currentStep,
              })}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </nav>
  );
};
