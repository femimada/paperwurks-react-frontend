import React from 'react';
import { Navigation } from '../Navigation';
import { Avatar } from '../../ui';

interface HeaderProps {
  className?: string;
  testId?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '', testId }) => {
  return (
    <header
      className={`sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 ${className}`}
      data-testid={testId}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_6_330)">
                <path
                  clipRule="evenodd"
                  d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </g>
              <defs>
                <clipPath id="clip0_6_330">
                  <rect fill="white" height="48" width="48" />
                </clipPath>
              </defs>
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Paperwurks</h1>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex">
            <Navigation />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-ring transition-colors">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a7 7 0 0 1 7 7v4l2 2v1h-5.2a3 3 0 0 1-5.6 0H5v-1l2-2V9a7 7 0 0 1 7-7zM9 16a3 3 0 0 0 6 0H9z" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <Avatar
              fallback="JD"
              size="base"
              className="cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
            />

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-ring">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
