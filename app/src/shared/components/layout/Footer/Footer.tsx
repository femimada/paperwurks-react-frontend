import React from 'react';

interface FooterProps {
  className?: string;
  testId?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '', testId }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-white border-t border-gray-200 mt-auto ${className}`}
      data-testid={testId}
    >
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} Paperwurks. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-900 focus-ring rounded-sm px-1 py-0.5 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900 focus-ring rounded-sm px-1 py-0.5 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/support"
              className="text-sm text-gray-600 hover:text-gray-900 focus-ring rounded-sm px-1 py-0.5 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
