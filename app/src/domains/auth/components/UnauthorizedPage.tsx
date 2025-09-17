// src/components/auth/UnauthorizedPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';
import { useAuth } from '@/domains/auth/hooks';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>

            <CardTitle className="text-2xl text-foreground">
              Access Denied
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You don't have permission to access this page.
              </p>
              {user && (
                <p className="text-sm text-muted-foreground">
                  You're logged in as{' '}
                  <span className="font-medium text-foreground">
                    {user.email}
                  </span>{' '}
                  with role{' '}
                  <span className="font-medium text-foreground">
                    {user.role}
                  </span>
                  .
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoBack}
                className="w-full"
                variant="default"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>

              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Sign in with a different account
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
