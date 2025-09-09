import React from 'react';
import type { NavItem } from '@/types/ui/component.types';

interface NavigationProps {
  items?: NavItem[];
  className?: string;
  testId?: string;
}

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    active: true,
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

export const Navigation: React.FC<NavigationProps> = ({
  items = defaultNavItems,
  className = '',
  testId,
}) => {
  return (
    <nav
      className={`flex items-center space-x-8 ${className}`}
      data-testid={testId}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`relative text-sm font-medium transition-colors focus-ring rounded-sm px-2 py-1 ${
            item.active
              ? 'text-blue-600'
              : item.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-current={item.active ? 'page' : undefined}
          tabIndex={item.disabled ? -1 : 0}
        >
          <span className="flex items-center gap-2">
            {item.icon && item.icon}
            {item.label}
            {item.badge && item.badge > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {item.badge}
              </span>
            )}
          </span>
        </a>
      ))}
    </nav>
  );
};
