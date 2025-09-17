// src/components/layout/Navigation/Navigation.tsx
import React, { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button, Badge } from '@/shared/components/ui';

interface NavigationProps {
  items?: NavItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  testId?: string;
}
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: number;
  active?: boolean;
  disabled?: boolean;
}

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    id: 'properties',
    label: 'Properties',
    href: '/properties',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    badge: 3,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
  },
];

/**
 * Navigation component - migrated to shadcn/ui
 * Uses Button components, proper focus states, and design tokens
 */
export const Navigation: React.FC<NavigationProps> = ({
  items = defaultNavItems,
  orientation = 'horizontal',
  className = '',
  testId,
}) => {
  const location = useLocation();

  const containerClasses = cn(
    'flex items-center',
    orientation === 'horizontal'
      ? 'space-x-1'
      : 'flex-col items-start space-y-1 space-x-0',
    className
  );

  return (
    <nav
      className={containerClasses}
      data-testid={testId}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const isDisabled = item.disabled;

        return (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            asChild={!isDisabled}
            disabled={isDisabled}
            className={cn(
              'relative justify-start',
              orientation === 'vertical' && 'w-full',
              isActive && 'bg-accent text-accent-foreground',
              isDisabled && 'cursor-not-allowed opacity-50'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {isDisabled ? (
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 px-1 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </span>
            ) : (
              <Link to={item.href} className="flex items-center gap-2">
                {item.icon}
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'h-5 px-1 text-xs',
                      orientation === 'horizontal' ? 'ml-1' : 'ml-auto'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )}
          </Button>
        );
      })}
    </nav>
  );
};
