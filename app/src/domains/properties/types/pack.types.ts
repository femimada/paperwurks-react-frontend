// src/types/property/pack.types.ts
import type {
  BaseEntity,
  PackStatus,
  DocumentCategory,
} from '@/shared/types/global.types';
import type { User } from '@/domains/auth/types';
import type { Property } from './property.types';

/**
 * Property pack interface - contains all documents and information for a property transaction
 */
export interface PropertyPack extends BaseEntity {
  // Basic information
  title: string;
  description?: string;
  status: PackStatus;

  // Relationships
  propertyId: string;
  property?: Property;
  ownerId: string;
  owner?: User;

  // Progress tracking
  completionPercentage: number;
  requiredDocuments: RequiredDocument[];
  uploadedDocuments: PackDocument[];
  missingDocuments: RequiredDocument[];

  // Sharing and access
  isShared: boolean;
  shareToken?: string;
  shareExpiresAt?: Date;
  sharedAt?: Date;
  sharedBy?: string;
  allowedViewers: PackViewer[];

  // Timeline and deadlines
  targetCompletionDate?: Date;
  actualCompletionDate?: Date;
  lastActivityAt?: Date;

  // Review and approval
  reviewStatus: PackReviewStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  approvedBy?: string;
  approvedAt?: Date;

  // System fields
  isActive: boolean;
  isArchived: boolean;
  version: number;
}

/**
 * Pack creation data
 */
export interface CreatePackData {
  title: string;
  description?: string;
  propertyId: string;
  targetCompletionDate?: Date;
  requiredDocumentCategories?: DocumentCategory[];
}

/**
 * Pack update data
 */
export interface UpdatePackData {
  title?: string;
  description?: string;
  status?: PackStatus;
  targetCompletionDate?: Date;
  reviewComments?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

/**
 * Required document for a property pack
 */
export interface RequiredDocument {
  id: string;
  packId: string;
  category: DocumentCategory;
  name: string;
  description?: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  uploadedDocumentId?: string;
  uploadedDocument?: PackDocument;
  order: number;

  // Validation rules
  allowedFileTypes: string[];
  maxFileSize: number;
  requiresReview: boolean;
}

/**
 * Document within a property pack
 */
export interface PackDocument extends BaseEntity {
  // Basic information
  name: string;
  originalName: string;
  description?: string;
  category: DocumentCategory;

  // File information
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  checksum: string;

  // Pack relationship
  packId: string;
  pack?: PropertyPack;
  requiredDocumentId?: string;
  requiredDocument?: RequiredDocument;

  // Upload information
  uploadedBy: string;
  uploader?: User;
  uploadedAt: Date;
  uploadProgress: number;
  uploadStatus: DocumentUploadStatus;

  // Processing and validation
  processingStatus: DocumentProcessingStatus;
  processingError?: string;
  processingCompletedAt?: Date;

  // Review and approval
  reviewStatus: DocumentReviewStatus;
  reviewedBy?: string;
  reviewer?: User;
  reviewedAt?: Date;
  reviewComments?: string;

  // Annotations and highlights
  annotations: DocumentAnnotation[];
  aiHighlights: AIHighlight[];

  // Version control
  version: number;
  parentDocumentId?: string;
  isLatestVersion: boolean;

  // Access control
  isConfidential: boolean;
  allowedRoles: string[];

  // System fields
  isActive: boolean;
  isDeleted: boolean;
}

/**
 * Pack viewer with access permissions
 */
export interface PackViewer {
  id: string;
  packId: string;
  userId?: string;
  user?: User;
  email: string;
  role: ViewerRole;
  permissions: ViewerPermission[];
  invitedBy: string;
  invitedAt: Date;
  accessedAt?: Date;
  lastAccessedAt?: Date;
  accessCount: number;
  isActive: boolean;
}

/**
 * Document annotation
 */
export interface DocumentAnnotation {
  id: string;
  documentId: string;
  userId: string;
  user?: User;
  content: string;
  type: AnnotationType;
  position: AnnotationPosition;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI-generated highlights
 */
export interface AIHighlight {
  id: string;
  documentId: string;
  type: HighlightType;
  content: string;
  position: AnnotationPosition;
  confidence: number;
  riskLevel: RiskLevel;
  explanation: string;
  suggestedAction?: string;
  createdAt: Date;
}

/**
 * Pack sharing configuration
 */
export interface PackSharingConfig {
  packId: string;
  isPublic: boolean;
  requiresAuth: boolean;
  allowDownload: boolean;
  allowPrint: boolean;
  watermarkDocuments: boolean;
  expiresAt?: Date;
  passwordProtected: boolean;
  password?: string;
  allowedDomains: string[];
  maxViews?: number;
  currentViews: number;
}

/**
 * Pack progress summary
 */
export interface PackProgress {
  packId: string;
  totalRequiredDocuments: number;
  uploadedDocuments: number;
  reviewedDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  pendingDocuments: number;
  completionPercentage: number;
  estimatedCompletionDate?: Date;
  isOnTrack: boolean;
  blockers: ProgressBlocker[];
}

/**
 * Progress blocker
 */
export interface ProgressBlocker {
  id: string;
  packId: string;
  type: BlockerType;
  description: string;
  severity: BlockerSeverity;
  assignedTo?: string;
  dueDate?: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

/**
 * Pack activity summary
 */
export interface PackActivity extends BaseEntity {
  packId: string;
  userId: string;
  user?: User;
  action: PackActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Pack statistics
 */
export interface PackStats {
  total: number;
  byStatus: Record<PackStatus, number>;
  averageCompletionTime: number; // Days
  completionRate: number; // Percentage
  documentsUploaded: number;
  documentsReviewed: number;
  activeShares: number;
}

// Enums and union types

export type DocumentUploadStatus =
  | 'pending'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type DocumentProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'requires_manual_review';

export type DocumentReviewStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'requires_changes';

export type PackReviewStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected';

export type ViewerRole = 'viewer' | 'reviewer' | 'editor' | 'admin';

export type ViewerPermission =
  | 'view_documents'
  | 'download_documents'
  | 'add_comments'
  | 'edit_pack'
  | 'manage_sharing';

export type AnnotationType =
  | 'comment'
  | 'highlight'
  | 'question'
  | 'issue'
  | 'approval'
  | 'rejection';

export interface AnnotationPosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
}

export type HighlightType =
  | 'risk_clause'
  | 'important_date'
  | 'financial_term'
  | 'legal_obligation'
  | 'unusual_clause'
  | 'missing_information';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type BlockerType =
  | 'missing_document'
  | 'document_rejected'
  | 'requires_review'
  | 'awaiting_approval'
  | 'external_dependency';

export type BlockerSeverity = 'low' | 'medium' | 'high' | 'critical';

export type PackActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'document_uploaded'
  | 'document_approved'
  | 'document_rejected'
  | 'shared'
  | 'unshared'
  | 'reviewed'
  | 'completed'
  | 'archived';

/**
 * Pack filters for listing and search
 */
export interface PackFilters {
  ownerId?: string;
  status?: PackStatus[];
  reviewStatus?: PackReviewStatus[];
  isShared?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  completionPercentageMin?: number;
  completionPercentageMax?: number;
  search?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

/**
 * Pack list item (simplified for lists)
 */
export interface PackListItem {
  id: string;
  title: string;
  status: PackStatus;
  completionPercentage: number;
  requiredDocumentsCount: number;
  uploadedDocumentsCount: number;

  // Property info
  property: {
    id: string;
    title: string;
    address: string;
  };

  // Owner info
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
  targetCompletionDate?: Date;
}
