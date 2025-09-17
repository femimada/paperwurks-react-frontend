// src/components/layout/PageLayout/PageLayout.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  variant?: 'default' | 'centered' | 'wide';
  className?: string;
  testId?: string;
}

/**
 * PageLayout component - migrated to shadcn/ui
 * Uses proper design tokens and flexible layout variants
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  variant = 'default',
  className = '',
  testId,
}) => {
  const containerClasses = cn(
    'min-h-screen bg-background flex flex-col',
    className
  );

  const mainClasses = cn(
    'flex-1',
    variant === 'centered' && 'flex items-center justify-center',
    variant === 'wide' && 'w-full'
  );

  return (
    <div className={containerClasses} data-testid={testId}>
      {showHeader && <Header />}

      <main className={mainClasses}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};
