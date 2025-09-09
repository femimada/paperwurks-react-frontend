import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  testId?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  className = '',
  testId,
}) => {
  return (
    <div
      className={`min-h-screen bg-secondary flex flex-col ${className}`}
      data-testid={testId}
    >
      {showHeader && <Header />}

      <main className="flex-1">{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};
