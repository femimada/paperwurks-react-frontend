// src/domains/properties/pages/PropertyCreatePage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { PropertyForm } from '@/domains/properties/components/PropertyForm';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import {
  Alert,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui';
import { ArrowLeft, Home, CheckCircle, FileText, Clock } from 'lucide-react';
import { buildRoute } from '@/shared/constants/routes';
import type {
  CreatePropertyData,
  UpdatePropertyData,
} from '@/domains/properties/types';
import { useAuth } from '@/domains/auth';
import { usePropertyCreate } from '@/domains/properties/hooks';

interface PropertyCreatePageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyCreatePage - Quick-Start property file creation
 * Allows agents to create property files in under 30 seconds
 */
export const PropertyCreatePage: React.FC<PropertyCreatePageProps> = ({
  className = '',
  testId = 'property-create-page',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  // Property creation mutation
  const {
    mutateAsync: createProperty,
    isPending,
    error: createError,
  } = usePropertyCreate();

  // Handle form submission
  const handleSubmit = async (
    data: CreatePropertyData | UpdatePropertyData
  ) => {
    try {
      const newProperty = await createProperty(data as CreatePropertyData);
      setShowSuccess(true);

      // Auto-redirect to property details after 3 seconds to show documents tab
      setTimeout(() => {
        navigate(buildRoute.propertyDetail(newProperty.id));
      }, 3000);
    } catch (err) {
      // Error is handled by the mutation and will appear in the form
      console.error('Failed to create property:', err);
    }
  };

  const handleCancel = () => {
    navigate('/properties');
  };

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
                Property File Created Successfully!
              </h1>
              <p className="text-muted-foreground mb-4">
                Your property file has been created and saved. You'll be
                redirected to the property dashboard where you can invite the
                seller to upload documents.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Redirecting in a few seconds...</span>
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
              <BreadcrumbPage>Create Property File</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to="/properties"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Properties
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Create Property File
                </h1>
                <p className="text-muted-foreground">
                  Start the conveyancing process with essential property
                  information
                </p>
              </div>
            </div>
          </div>

          {/* Quick-Start Benefits Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Quick-Start Process:</strong> Our streamlined workflow
              lets you create a property file in under 30 seconds with just the
              essential information needed to begin document collection. You can
              always add more details later.
            </AlertDescription>
          </Alert>

          {/* Property Form */}
          <PropertyForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isPending}
          />

          {/* Next Steps Info */}
          <div className="max-w-2xl mx-auto">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> After creating your property file,
                you'll be able to:
                <ul className="mt-2 ml-4 space-y-1 text-sm">
                  <li>
                    • Invite the seller to upload required legal documents
                  </li>
                  <li>• Track document collection progress</li>
                  <li>
                    • Share the property file with solicitors and other
                    stakeholders
                  </li>
                  <li>• Add additional property details as needed</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
