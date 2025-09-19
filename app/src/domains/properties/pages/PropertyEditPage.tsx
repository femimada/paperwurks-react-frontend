// src/domains/properties/pages/PropertyEditPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { PropertyForm } from '@/domains/properties/components/PropertyForm';
import { PageLayout } from '@/shared/components/layout/PageLayout';
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
} from '@/shared/components/ui';
import {
  ArrowLeft,
  Edit,
  Home,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
} from 'lucide-react';
import { buildRoute } from '@/shared/constants/routes';
import type { UpdatePropertyData } from '@/domains/properties/types';
import { useAuth } from '@/domains/auth';
import { useProperty, usePropertyUpdate } from '@/domains/properties/hooks';

interface PropertyEditPageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyEditPage - Page for editing property files
 * Maintains Quick-Start simplicity while allowing essential updates
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

  const getFileReference = () => {
    return (
      (property as any)?.fileReference ||
      `${property?.address?.line1} - ${property?.title || 'Property Sale'}`
    );
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
            <Card className="max-w-2xl mx-auto">
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
                Property File Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {propertyError
                  ? propertyError
                  : "The property file you're trying to edit doesn't exist or you don't have permission to access it."}
              </p>
              <Button variant="outline" onClick={() => navigate('/properties')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
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
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-muted-foreground">
                You don't have permission to edit this property file.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(buildRoute.propertyDetail(property.id))}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                View Property File
              </Button>
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
          data-testid={testId}
        >
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-green-700 mb-2">
                Property File Updated Successfully!
              </h1>
              <p className="text-muted-foreground mb-4">
                Your changes have been saved. You'll be redirected to the
                property dashboard.
              </p>
              <div className="text-sm text-muted-foreground">
                Redirecting in a moment...
              </div>
            </div>
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
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Home</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/properties">Properties</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={buildRoute.propertyDetail(property.id)}>
                    Property File
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to={buildRoute.propertyDetail(property.id)}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Property File
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Edit className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Edit Property File
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {property.address.line1}, {property.address.city}
                  </span>
                  <span>•</span>
                  <FileText className="h-4 w-4" />
                  <span>{getFileReference()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Information */}
          <Alert className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Quick Edit:</strong> Update the essential property
              information. You can modify the address, file reference, or tenure
              as needed.
            </AlertDescription>
          </Alert>

          {/* Property Form */}
          <PropertyForm
            property={property}
            mode="edit"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />

          {/* Update Error */}
          {updateError && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to update property file. Please try again or contact
                support if the problem persists.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
