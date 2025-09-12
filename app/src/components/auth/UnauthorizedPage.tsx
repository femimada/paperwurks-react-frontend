// src/components/auth/UnauthorizedPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/auth';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              You don't have permission to access this page.
              {user && (
                <span className="block mt-2">
                  You're logged in as <strong>{user.email}</strong> with role{' '}
                  <strong>{user.role}</strong>.
                </span>
              )}
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleGoBack}
                className="w-full"
              >
                Go Back
              </Button>

              <Link to="/dashboard" className="block w-full btn btn--outline">
                Go to Dashboard
              </Link>

              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Sign in with a different account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
