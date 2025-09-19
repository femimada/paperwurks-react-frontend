// src/domains/properties/types/property.types.ts
import type {
  BaseEntity,
  Address,
  PropertyType,
  PropertyTenure,
  PropertyStatus,
} from '@/shared/types/global.types';

import type { PropertyPack } from './pack.types';
import type { User } from '@/domains/auth/types/auth.types';

/**
 * Core property interface
 */
export interface Property extends BaseEntity {
  title: string;
  description?: string;
  address: Address;
  propertyType: PropertyType;
  tenure: PropertyTenure;
  status: PropertyStatus;
  fileReference: string; // NEW: Agent's internal case/file reference

  // Property details
  bedrooms?: number;
  bathrooms?: number;
  receptionRooms?: number;
  floorArea?: number; // Square feet
  plotSize?: number; // Square feet
  yearBuilt?: number;
  councilTaxBand?: string;
  energyRating?: string;

  // Financial information
  askingPrice?: number;
  estimatedValue?: number;
  monthlyServiceCharge?: number; // For leasehold
  groundRent?: number; // For leasehold

  // Leasehold specific
  leaseYearsRemaining?: number;
  freeholder?: string;
  managementCompany?: string;

  // Ownership and access
  ownerId: string;
  owner?: User;
  assignedAgentId?: string;
  assignedAgent?: User;
  assignedSolicitorId?: string;
  assignedSolicitor?: User;

  // Pack information
  packId?: string;
  pack?: PropertyPack;

  // Progress tracking
  completionPercentage: number;
  lastActivityAt?: Date;
  targetCompletionDate?: Date;

  // Additional metadata
  images?: PropertyImage[];
  floorPlans?: PropertyDocument[];
  keyFeatures?: string[];
  nearbyAmenities?: string[];

  // System fields
  isActive: boolean;
  isArchived: boolean;
}

/**
 * Property creation data - Minimal Quick-Start fields
 */
export interface CreatePropertyData {
  // Essential Quick-Start fields only
  title: string; // Auto-generated from fileReference
  address: Address;
  tenure: PropertyTenure;
  fileReference: string; // NEW: Required field for Quick-Start workflow
  propertyType: PropertyType; // Default to 'detached', can be updated later

  // Optional fields (can be added later via edit)
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  receptionRooms?: number;
  floorArea?: number;
  plotSize?: number;
  yearBuilt?: number;
  councilTaxBand?: string;
  energyRating?: string;

  // Financial information (optional)
  askingPrice?: number;
  estimatedValue?: number;
  monthlyServiceCharge?: number;
  groundRent?: number;

  // Leasehold specific (optional)
  leaseYearsRemaining?: number;
  freeholder?: string;
  managementCompany?: string;

  // Assignments (optional)
  assignedAgentId?: string;
  assignedSolicitorId?: string;

  // Additional data (optional)
  keyFeatures?: string[];
  nearbyAmenities?: string[];
  targetCompletionDate?: Date;
}

/**
 * Property update data
 */
export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  status?: PropertyStatus;
  completionPercentage?: number;
  lastActivityAt?: Date;
  isActive?: boolean;
  isArchived?: boolean;
}

/**
 * Property list filters
 */
export interface PropertyFilters {
  ownerId?: string;
  agentId?: string;
  solicitorId?: string;
  status?: PropertyStatus | PropertyStatus[];
  propertyType?: PropertyType | PropertyType[];
  tenure?: PropertyTenure[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  location?: string;
  search?: string;
  isActive?: boolean;
  isArchived?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  fileReference?: string; // NEW: Filter by file reference
}

/**
 * Property list item (simplified for lists)
 */
export interface PropertyListItem {
  id: string;
  title: string;
  address: Pick<Address, 'line1' | 'city' | 'postcode' | 'country'>;
  propertyType: PropertyType;
  tenure: PropertyTenure;
  status: PropertyStatus;
  fileReference: string; // NEW: Display in property lists
  askingPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  completionPercentage: number;

  // Relationships
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  assignedAgent?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  assignedSolicitor?: Pick<User, 'id' | 'firstName' | 'lastName'>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

/**
 * Property image interface
 */
export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Property document interface (for floorplans, etc.)
 */
export interface PropertyDocument {
  id: string;
  propertyId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  documentType: 'floorplan' | 'epc' | 'brochure' | 'legal' | 'other';
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Property statistics
 */
export interface PropertyStats {
  total: number;
  byStatus: Record<PropertyStatus, number>;
  byType: Record<PropertyType, number>;
  byTenure: Record<PropertyTenure, number>;
  averageCompletionTime: number; // Days
  completionRate: number; // Percentage
  totalValue: number;
  averageValue: number;
}

/**
 * Property activity log entry
 */
export interface PropertyActivity {
  id: string;
  propertyId: string;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  action: PropertyActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Property activity types
 */
export type PropertyActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'document_uploaded'
  | 'document_removed'
  | 'agent_assigned'
  | 'solicitor_assigned'
  | 'seller_invited' // NEW: For inviting sellers to upload documents
  | 'documents_requested' // NEW: For document requests
  | 'shared'
  | 'viewed'
  | 'commented';

/**
 * Property search result
 */
export interface PropertySearchResult extends PropertyListItem {
  score: number; // Relevance score
  highlights: {
    field: string;
    matches: string[];
  }[];
}

/**
 * Property validation rules
 */
export interface PropertyValidationRules {
  title: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  fileReference: {
    // NEW: Validation rules for file reference
    minLength: number;
    maxLength: number;
    required: boolean;
    pattern?: string;
  };
  description: {
    maxLength: number;
    required: boolean;
  };
  address: {
    required: boolean;
    validatePostcode: boolean;
  };
  tenure: {
    required: boolean;
  };
  askingPrice: {
    min: number;
    max: number;
    required: boolean;
  };
  bedrooms: {
    min: number;
    max: number;
  };
  bathrooms: {
    min: number;
    max: number;
  };
}

/**
 * Property import/export data
 */
export interface PropertyImportData {
  properties: CreatePropertyData[];
  errors: PropertyImportError[];
  successCount: number;
  errorCount: number;
}

export interface PropertyImportError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface PropertyExportData {
  properties: Property[];
  format: 'csv' | 'xlsx' | 'json';
  filters?: PropertyFilters;
  exportedAt: Date;
  exportedBy: string;
}

/**
 * Document invitation data - NEW: For inviting sellers to upload documents
 */
export interface DocumentInvitation {
  id: string;
  propertyId: string;
  invitedBy: string;
  invitedByUser?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  recipientEmail: string;
  recipientName?: string;
  status: 'pending' | 'sent' | 'viewed' | 'completed' | 'expired';
  secureToken: string;
  expiresAt: Date;
  createdAt: Date;
  viewedAt?: Date;
  completedAt?: Date;
  requiredDocuments: string[]; // List of document types required
  message?: string; // Optional message from agent to seller
}
