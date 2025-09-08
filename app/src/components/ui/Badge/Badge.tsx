import React from 'react';
import type { BadgeProps } from '@/types/ui/component.types';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'base',
  dot = false,
  children,
  className = '',
  testId,
}) => {
  const baseClasses = 'status-badge';
  const variantClasses = `status-badge--${variant}`;
  const sizeClasses = size !== 'base' ? `status-badge--${size}` : '';

  const combinedClasses = [baseClasses, variantClasses, sizeClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={combinedClasses} data-testid={testId}>
      {dot && <span className="status-badge__dot" />}
      {children}
    </span>
  );
};
