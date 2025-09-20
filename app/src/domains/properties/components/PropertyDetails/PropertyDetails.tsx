// src/domains/properties/components/PropertyDetails/PropertyDetails.tsx - FINAL VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/domains/auth';

import { PropertySummary } from '@/domains/properties/components/PropertySummary';
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
  Alert,
  AlertDescription,
} from '@/shared/components/ui';
import {
  Edit,
  Share,
  FileText,
  Activity,
  Settings,
  MapPin,
  Upload,
  Mail,
  Clock,
  Users,
} from 'lucide-react';
import { buildRoute } from '@/shared/constants/routes';
import type { Property } from '@/domains/properties/types';

interface PropertyFileDashboardProps {
  property: Property;
  className?: string;
  testId?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onInviteSeller?: () => void;
}

/**
 * PropertyFileDashboard - Property File Dashboard focused on document management
 * Primary purpose: initiate and manage the conveyancing document collection process
 *
 * This is a COMPONENT that displays property file information and document management tools.
 * It should be used within page components, not as a standalone page.
 */
export const PropertyFileDashboard: React.FC<PropertyFileDashboardProps> = ({
  property,
  className = '',
  testId = 'property-file-dashboard',
  onEdit,
  onShare,
  onInviteSeller,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('documents'); // Default to documents tab

  // Permission checks
  const isOwner = property && user && property.owner?.id === user.id;
  const isAgent = user?.role === 'agent';

  const canEdit = isOwner || isAgent;
  const canShare = canEdit;
  const canInviteSeller = isAgent; // Only agents can invite sellers

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else if (property) {
      navigate(buildRoute.propertyEdit(property.id));
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // TODO: Implement sharing functionality
      console.log('Share property:', property?.id);
    }
  };

  const handleInviteSellerToUploadDocuments = () => {
    if (onInviteSeller) {
      onInviteSeller();
    } else {
      // TODO: Implement seller invitation functionality
      console.log(
        'Invite seller to upload documents for property:',
        property?.id
      );

      // For now, show a simple alert
      alert(
        'Seller invitation feature coming soon! This will send a secure link to the property owner to upload required documents.'
      );
    }
  };

  if (!property) {
    return (
      <Alert>
        <AlertDescription>
          Property information is not available.
        </AlertDescription>
      </Alert>
    );
  }

  // Convert status color to badge variant
  const getStatusVariant = (status: string) => {
    // Define status colors locally to avoid import issues
    const statusColors: Record<string, string> = {
      draft: 'neutral',
      in_progress: 'warning',
      ready: 'success',
      shared: 'info',
      completed: 'success',
    };

    const color = statusColors[status] || 'neutral';

    switch (color) {
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

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      in_progress: 'In Progress',
      ready: 'Ready',
      shared: 'Shared',
      completed: 'Completed',
    };
    return statusLabels[status] || status;
  };

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* Property Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {property.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address.line1}, {property.address.city}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Ref: {property.fileReference}</span>
            </div>
            <Badge variant={getStatusVariant(property.status)} className="ml-2">
              {getStatusLabel(property.status)}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canShare && (
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {canInviteSeller && (
            <Button onClick={handleInviteSellerToUploadDocuments}>
              <Mail className="h-4 w-4 mr-2" />
              Invite Seller
            </Button>
          )}
        </div>
      </div>

      {/* Quick Property Summary */}
      <PropertySummary property={property} testId="property-summary-compact" />

      {/* Document Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-4">
                <div className="text-muted-foreground">
                  Document management system will be available in Stage 4
                </div>
                {canInviteSeller && (
                  <Button onClick={handleInviteSellerToUploadDocuments}>
                    <Mail className="h-4 w-4 mr-2" />
                    Invite Seller to Upload Documents
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity timeline will be available in Stage 5
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Property Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assigned Agent</label>
                  <p className="text-sm text-muted-foreground">
                    {property.assignedAgent
                      ? `${property.assignedAgent.firstName} ${property.assignedAgent.lastName}`
                      : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Assigned Solicitor
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {property.assignedSolicitor
                      ? `${property.assignedSolicitor.firstName} ${property.assignedSolicitor.lastName}`
                      : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Completion Target
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {property.targetCompletionDate
                      ? new Date(
                          property.targetCompletionDate
                        ).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Progress</label>
                  <p className="text-sm text-muted-foreground">
                    {property.completionPercentage}% complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
