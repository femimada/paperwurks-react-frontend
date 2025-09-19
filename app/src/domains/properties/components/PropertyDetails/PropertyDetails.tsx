// src/domains/properties/pages/PropertyDetailsPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/domains/auth';

import { PropertySummary } from '@/domains/properties/components/PropertySummary';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Skeleton,
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
  Edit,
  Share,
  FileText,
  Activity,
  Settings,
  Home,
  MapPin,
  User,
  Upload,
  Mail,
  Clock,
  CheckCircle,
  Users,
} from 'lucide-react';
import { buildRoute } from '@/shared/constants/routes';
import { PROPERTY_STATUSES } from '@/shared/constants/status';
import { useProperty } from '@/domains/properties/hooks/useProperties';

interface PropertyDetailsPageProps {
  className?: string;
  testId?: string;
}

/**
 * PropertyDetailsPage - Property File Dashboard focused on document management
 * Primary purpose: initiate and manage the conveyancing document collection process
 */
export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({
  className = '',
  testId = 'property-details-page',
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documents'); // Default to documents tab

  // Fetch property data
  const { data: property, isLoading, error } = useProperty(id!);

  // Permission checks
  const isOwner = property && user && property.owner?.id === user.id;
  const isAgent = user?.role === 'agent';

  const canEdit = isOwner || isAgent;
  const canShare = canEdit;
  const canInviteSeller = isAgent; // Only agents can invite sellers

  const handleEdit = () => {
    if (property) {
      navigate(buildRoute.propertyEdit(property.id));
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Share property:', property?.id);
  };

  const handleInviteSellerToUploadDocuments = () => {
    // TODO: Implement seller invitation functionality
    // This would typically send an email invitation or create a secure link
    console.log(
      'Invite seller to upload documents for property:',
      property?.id
    );

    // For now, show a simple alert
    alert(
      'Seller invitation feature coming soon! This will send a secure link to the property owner to upload required documents.'
    );
  };

  const getStatusVariant = (status: string) => {
    const statusConfig =
      PROPERTY_STATUSES[status as keyof typeof PROPERTY_STATUSES];
    switch (statusConfig?.color) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'info':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getFileReference = () => {
    // Try to get file reference from property, fallback to address-based reference
    return (
      (property as any)?.fileReference ||
      `${property?.address?.line1} - ${property?.title || 'Property Sale'}`
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
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-64 w-full" />
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
              <CardTitle className="text-center text-destructive">
                Property File Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                The property file you're looking for doesn't exist or you don't
                have permission to access it.
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
              <BreadcrumbPage>Property File</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header with Property Address and File Reference */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/properties')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                    {property.address.line1}, {property.address.city}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    <FileText className="h-4 w-4 inline mr-1" />
                    File Reference:{' '}
                    <span className="font-medium">{getFileReference()}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(property.status)}>
                  {PROPERTY_STATUSES[
                    property.status as keyof typeof PROPERTY_STATUSES
                  ]?.label || property.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {property.tenure}
                </Badge>
                {property.address.postcode && (
                  <Badge variant="outline">{property.address.postcode}</Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {canShare && (
                <Button variant="outline" onClick={handleShare}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </div>

          {/* Primary CTA - Invite Seller to Upload Documents */}
          {canInviteSeller && (
            <Alert className="border-green-200 bg-green-50">
              <Upload className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <div className="text-green-700">
                  <strong>Next Step:</strong> Invite the seller to upload the
                  required legal documents to proceed with the conveyancing
                  process.
                </div>
                <Button
                  onClick={handleInviteSellerToUploadDocuments}
                  className="ml-4 bg-green-600 hover:bg-green-700"
                  data-testid="invite-seller-button"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Invite Seller to Upload Documents
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Property Summary Card */}
          <PropertySummary property={property} />

          {/* Main Content - Tabs (Default to Documents) */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2"
                disabled={!canEdit}
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Documents Tab - Primary Focus */}
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Collection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Document Status Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        <div className="font-semibold">Pending</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Documents awaiting upload
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <div className="font-semibold">Complete</div>
                        <div className="text-2xl font-bold text-green-600">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Documents uploaded
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <div className="font-semibold">Under Review</div>
                        <div className="text-2xl font-bold text-blue-600">
                          0
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Being reviewed
                        </div>
                      </div>
                    </div>

                    {/* Required Documents List */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        Required Documents ({property.tenure})
                      </h3>
                      <div className="space-y-2">
                        {property.tenure === 'freehold' ? (
                          <>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Title Deeds</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Energy Performance Certificate (EPC)</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Property Information Form (TA6)</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Lease Agreement</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Service Charge Accounts</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Ground Rent Schedule</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Energy Performance Certificate (EPC)</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Property Information Form (TA6)</span>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Document Management Coming Soon */}
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        Document Upload & Management
                      </p>
                      <p className="mb-4">
                        Full document management capabilities will be available
                        in Stage 4 of development.
                      </p>
                      <p className="text-sm">
                        For now, use the "Invite Seller" button above to begin
                        the document collection process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Property Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="text-right font-medium">
                        {property.address.line1}
                        {property.address.line2 && (
                          <>
                            <br />
                            {property.address.line2}
                          </>
                        )}
                        <br />
                        {property.address.city}, {property.address.postcode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenure</span>
                      <span className="font-medium capitalize">
                        {property.tenure}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        File Reference
                      </span>
                      <span className="font-medium">{getFileReference()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={getStatusVariant(property.status)}>
                        {PROPERTY_STATUSES[
                          property.status as keyof typeof PROPERTY_STATUSES
                        ]?.label || property.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Stakeholders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Stakeholders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.owner && (
                      <div className="flex items-center gap-3 p-2 border rounded">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Property Owner</div>
                          <div className="text-sm text-muted-foreground">
                            {property.owner.firstName} {property.owner.lastName}
                          </div>
                        </div>
                      </div>
                    )}

                    {property.assignedAgent && (
                      <div className="flex items-center gap-3 p-2 border rounded">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Estate Agent</div>
                          <div className="text-sm text-muted-foreground">
                            {property.assignedAgent.firstName}{' '}
                            {property.assignedAgent.lastName}
                          </div>
                        </div>
                      </div>
                    )}

                    {property.assignedSolicitor && (
                      <div className="flex items-center gap-3 p-2 border rounded">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Solicitor</div>
                          <div className="text-sm text-muted-foreground">
                            {property.assignedSolicitor.firstName}{' '}
                            {property.assignedSolicitor.lastName}
                          </div>
                        </div>
                      </div>
                    )}

                    {!property.assignedAgent && !property.assignedSolicitor && (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">
                          No additional stakeholders assigned
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Property File Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Activity Timeline Coming Soon
                    </p>
                    <p>
                      Track all property file activities and communications in
                      the next release.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              {canEdit ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Property File Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Edit Property Details</div>
                        <div className="text-sm text-muted-foreground">
                          Update address, file reference, or tenure information
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">Share Property File</div>
                        <div className="text-sm text-muted-foreground">
                          Generate secure links for stakeholders
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleShare}>
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>Created:</strong>{' '}
                          {new Date(property.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Last Updated:</strong>{' '}
                          {new Date(property.updatedAt).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Property ID:</strong> {property.id}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Access Restricted
                    </p>
                    <p>You don't have permission to modify these settings.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};
