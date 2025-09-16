// src/pages/properties/PropertyEditPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useProperty } from '@/hooks';
import { usePropertyUpdate } from '@/hooks';
import { PropertyForm } from '@/features/properties/PropertyForm';
import { PageLayout } from '@/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Skeleton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import {
  ArrowLeft,
  Edit,
  Home,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { buildRoute } from '@/constants/routes';
import type { UpdatePropertyData } from '@/types/property';

interface PropertyEditPageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyEditPage - Page for editing existing properties
 * Integrates PropertyForm with update logic and navigation
 */
export const PropertyEditPage: React.FC<PropertyEditPageProps> = ({
  className = '',
  testId = 'property-edit-page',
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch existing property data
  const {
    data: property,
    isLoading: isLoadingProperty,
    error: propertyError,
  } = useProperty(id!);

  // Property update mutation
  const {
    mutateAsync: updateProperty,
    isPending,
    error: updateError,
  } = usePropertyUpdate();

  // Check permissions
  const canEdit =
    property && (user?.id === property?.owner?.id || user?.role === 'agent');

  // Handle form submission
  const handleSubmit = async (data: UpdatePropertyData) => {
    if (!property) return;

    try {
      await updateProperty({ id: property.id, ...data });
      setShowSuccess(true);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate(buildRoute.propertyDetail(property.id));
      }, 2000);
    } catch (err) {
      // Error is handled by the mutation and will appear in the form
      console.error('Failed to update property:', err);
    }
  };

  const handleCancel = () => {
    if (property) {
      navigate(buildRoute.propertyDetail(property.id));
    } else {
      navigate('/properties');
    }
  };

  const handleViewProperty = () => {
    if (property) {
      navigate(buildRoute.propertyDetail(property.id));
    }
  };

  // Loading state
  if (isLoadingProperty) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (propertyError || !property) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive">
                Property Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {propertyError &&
                typeof propertyError === 'object' &&
                'message' in propertyError
                  ? (propertyError as any).message
                  : "The property you're trying to edit doesn't exist or you don't have permission to edit it."}
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

  // Permission check
  if (!canEdit) {
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
                You don't have permission to edit this property. Only the
                property owner and assigned agents can make changes.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => navigate('/properties')}
                  variant="outline"
                >
                  Back to Properties
                </Button>
                <Button onClick={handleViewProperty}>View Property</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Success state
  if (showSuccess) {
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
                  Property Updated!
                </h2>
                <p className="text-green-700 mb-6">
                  Your changes have been saved successfully.
                </p>
                <Button
                  onClick={handleViewProperty}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  View Property
                </Button>
                <p className="text-sm text-green-600 mt-4">
                  Redirecting to property details in 2 seconds...
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
              <BreadcrumbLink asChild>
                <Link to={buildRoute.propertyDetail(property.id)}>
                  {property.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
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
                Edit Property
              </h1>
              <p className="text-muted-foreground">{property.title}</p>
            </div>
          </div>
        </div>

        {/* Information Alert */}
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Changes to property information will be saved immediately and may
            affect shared property packs.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {updateError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {updateError instanceof Error
                ? updateError.message
                : 'Failed to update property. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Property Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyForm
              property={property}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isPending}
              mode="edit"
              testId="edit-property-form"
            />
          </CardContent>
        </Card>

        {/* Warning for shared properties */}
        {property.status === 'shared' && (
          <Alert className="mt-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This property has been shared with
              others. Changes you make will be visible to all parties with
              access to the property pack.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </PageLayout>
  );
};
