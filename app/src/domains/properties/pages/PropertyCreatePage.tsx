// src/pages/properties/PropertyCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { PageLayout } from '@/shared/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui';
import {
  ArrowLeft,
  Plus,
  Home,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { buildRoute } from '@/shared/constants/routes';
import type {
  CreatePropertyData,
  UpdatePropertyData,
} from '@/domains/properties/types';
import { useAuth } from '@/domains/auth';
import { usePropertyCreate } from '@/domains/properties/hooks';
import { PropertyForm } from '@/domains/properties/components';

interface PropertyCreatePageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyCreatePage - Page for creating new properties
 * Integrates PropertyForm with creation logic and navigation
 */
export const PropertyCreatePage: React.FC<PropertyCreatePageProps> = ({
  className = '',
  testId = 'property-create-page',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    null
  );

  // Property creation mutation
  const { mutateAsync: createProperty, isPending, error } = usePropertyCreate();

  // Check permissions
  const canCreateProperty = user?.role === 'owner' || user?.role === 'agent';

  // Handle form submission
  const handleSubmit = async (
    data: CreatePropertyData | UpdatePropertyData
  ) => {
    try {
      const property = await createProperty(data as CreatePropertyData);
      setCreatedPropertyId(property.id);
      setShowSuccess(true);

      // Auto-redirect after 3 seconds or let user choose
      setTimeout(() => {
        navigate(buildRoute.propertyDetail(property.id));
      }, 3000);
    } catch (err) {
      // Error is handled by the mutation and will appear in the form
      console.error('Failed to create property:', err);
    }
  };

  const handleCancel = () => {
    navigate('/properties');
  };

  const handleViewProperty = () => {
    if (createdPropertyId) {
      navigate(buildRoute.propertyDetail(createdPropertyId));
    }
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setCreatedPropertyId(null);
    // Form will reset automatically
  };

  // Unauthorized access
  if (!canCreateProperty) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have permission to create properties.
                {user?.role === 'solicitor' &&
                  ' Only property owners and agents can create properties.'}
                {user?.role === 'buyer' &&
                  ' Only property owners and agents can create properties.'}
              </p>
              <Button onClick={() => navigate('/properties')} variant="outline">
                Back to Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Success state
  if (showSuccess && createdPropertyId) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={`${testId}-success`}
        >
          <div className="max-w-md mx-auto text-center">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Property Created!
                </h2>
                <p className="text-green-700 mb-6">
                  Your property has been successfully created. You can now add
                  documents and share it with others.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleViewProperty}
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    View Property
                  </Button>
                  <Button
                    onClick={handleCreateAnother}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Another
                  </Button>
                </div>
                <p className="text-sm text-green-600 mt-4">
                  Redirecting to property details in 3 seconds...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div
        className={`container mx-auto px-4 py-8 ${className}`}
        data-testid={testId}
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/properties">Properties</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Property</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Create New Property
              </h1>
              <p className="text-muted-foreground">
                Add a new property to your portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Information Alert */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Complete all required fields to create your property. You can add
            documents and additional details after creation.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'Failed to create property. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Property Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isPending}
              mode="create"
              testId="create-property-form"
            />
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-2">Next Steps</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• After creation, you can upload property documents</li>
              <li>
                • Invite solicitors and buyers to review the property pack
              </li>
              <li>• Share secure links with interested parties</li>
              <li>• Track progress and manage communications</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
