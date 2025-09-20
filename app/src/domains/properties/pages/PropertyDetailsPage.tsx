// src/domains/properties/pages/PropertyDetailsPage.tsx - UPDATED
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { PropertyFileDashboard } from '@/domains/properties/components/PropertyDetails';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui';
import { ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { buildRoute } from '@/shared/constants/routes';
import { useProperty } from '../hooks/useProperties';

interface PropertyDetailsPageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyDetailsPage - Page wrapper for property file dashboard
 * Handles routing, loading states, and page layout
 * Contains the PropertyFileDashboard component
 */
export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  className = '',
  testId = 'property-details-page',
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch property data
  const { data: property, isLoading, error, refetch } = useProperty(id!);

  // Navigation handlers
  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    if (property) {
      navigate(buildRoute.propertyEdit(property.id));
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Share property:', property?.id);
  };

  const handleInviteSeller = () => {
    // TODO: Implement seller invitation functionality
    console.log(
      'Invite seller to upload documents for property:',
      property?.id
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <div className="space-y-6">
            {/* Breadcrumb skeleton */}
            <Skeleton className="h-4 w-64" />

            {/* Header skeleton */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-96" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <PageLayout>
        <div
          className={`container mx-auto px-4 py-8 ${className}`}
          data-testid={testId}
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-destructive flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Property Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error && typeof error === 'object' && 'message' in error
                  ? (error as any).message
                  : "The property you're looking for doesn't exist or you don't have permission to view it."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
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
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
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
            <BreadcrumbPage>{property.title}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
        </div>

        {/* Property File Dashboard */}
        <PropertyFileDashboard
          property={property}
          onEdit={handleEdit}
          onShare={handleShare}
          onInviteSeller={handleInviteSeller}
          testId="property-file-dashboard"
        />
      </div>
    </PageLayout>
  );
};
