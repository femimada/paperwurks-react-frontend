// src/features/auth/components/RegisterForm/components/PasswordStrengthMeter.tsx
import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface PasswordStrength {
  score: number;
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
  percentage: number;
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else if (password.length > 0) {
    feedback.push('At least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Character type checks
  if (/[a-z]/.test(password)) {
    score++;
  } else if (password.length > 0) {
    feedback.push('One lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else if (password.length > 0) {
    feedback.push('One uppercase letter');
  }

  if (/\d/.test(password)) {
    score++;
  } else if (password.length > 0) {
    feedback.push('One number');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
    feedback.push('Special character (optional but recommended)');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // Calculate percentage (max score is 6)
  const percentage = Math.min((score / 6) * 100, 100);

  return { score, strength, feedback, percentage };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  className = '',
}) => {
  const { strength, feedback, percentage } = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'weak':
        return { text: 'Weak', color: 'text-red-600' };
      case 'medium':
        return { text: 'Medium', color: 'text-yellow-600' };
      case 'strong':
        return { text: 'Strong', color: 'text-green-600' };
      default:
        return { text: '', color: '' };
    }
  };

  const strengthText = getStrengthText();

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength</span>
        {strengthText.text && (
          <span className={`text-xs font-medium ${strengthText.color}`}>
            {strengthText.text}
          </span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${getStrengthColor()}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strengthText.text}`}
        />
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <ul className="mt-2 text-xs text-gray-500 space-y-0.5">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
