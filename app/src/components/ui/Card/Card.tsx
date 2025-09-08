import React from 'react';
import type { CardProps } from '@/types/ui/component.types';

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  padding = 'base',
  shadow = true,
  children,
  className = '',
  testId,
  ...props
}) => {
  const baseClasses = 'card';
  const shadowClasses = shadow ? 'shadow' : '';
  const combinedClasses = [baseClasses, shadowClasses, className]
    .filter(Boolean)
    .join(' ');

  const paddingMap = {
    sm: 'p-4',
    base: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <div className={combinedClasses} data-testid={testId} {...props}>
      {header && <div className="card__header">{header}</div>}

      <div className={`card__body ${paddingMap[padding]}`}>{children}</div>

      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
};
