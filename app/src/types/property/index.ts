// src/types/property/index.ts
export type {
  // Property types
  Property,
  CreatePropertyData,
  UpdatePropertyData,
  PropertyFilters,
  PropertyListItem,
  PropertyImage,
  PropertyDocument,
  PropertyStats,
  PropertyActivity,
  PropertyActivityType,
  PropertySearchResult,
  PropertyValidationRules,
  PropertyImportData,
  PropertyImportError,
  PropertyExportData,
} from './property.types';

export type {
  // Pack types
  PropertyPack,
  CreatePackData,
  UpdatePackData,
  RequiredDocument,
  PackDocument,
  PackViewer,
  DocumentAnnotation,
  AIHighlight,
  PackSharingConfig,
  PackProgress,
  ProgressBlocker,
  PackActivity,
  PackStats,
  PackFilters,
  PackListItem,

  // Status and enum types
  DocumentUploadStatus,
  DocumentProcessingStatus,
  DocumentReviewStatus,
  PackReviewStatus,
  ViewerRole,
  ViewerPermission,
  AnnotationType,
  AnnotationPosition,
  HighlightType,
  RiskLevel,
  BlockerType,
  BlockerSeverity,
  PackActivityType,
} from './pack.types';
