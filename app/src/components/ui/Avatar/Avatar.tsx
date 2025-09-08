import React from 'react';
import type { AvatarProps } from '@/types/ui/component.types';
import { getInitials } from '@/utils/formatting/stringUtils';

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'base',
  className = '',
  testId,
}) => {
  const sizeClasses = {
    sm: 'avatar--sm',
    base: 'avatar',
    lg: 'avatar--lg',
    xl: 'avatar--xl',
  };

  const avatarClasses = ['avatar', sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  const displayFallback = fallback || getInitials(alt || '');

  return (
    <div className={avatarClasses} data-testid={testId}>
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image on error and show fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium">
          {displayFallback}
        </div>
      )}
    </div>
  );
};
