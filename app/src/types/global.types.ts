// Global type definitions for Paperwurks application

/**
 * Base entity interface that all domain entities extend
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles in the system
 */
export type UserRole = "owner" | "agent" | "solicitor" | "buyer";

/**
 * User permissions
 */
export type Permission =
  | "property:create"
  | "property:read"
  | "property:update"
  | "property:delete"
  | "document:upload"
  | "document:read"
  | "document:annotate"
  | "pack:share"
  | "pack:review"
  | "user:manage";

/**
 * Generic status types used across the application
 */
export type Status = "active" | "inactive" | "pending" | "archived";

/**
 * Property-specific status types
 */
export type PropertyStatus =
  | "draft"
  | "in_progress"
  | "ready"
  | "shared"
  | "completed";

/**
 * Document status types
 */
export type DocumentStatus = "uploading" | "processing" | "ready" | "error";

/**
 * Property pack status
 */
export type PackStatus =
  | "draft"
  | "in_progress"
  | "ready"
  | "shared"
  | "completed";

/**
 * Property types
 */
export type PropertyType =
  | "detached"
  | "semi_detached"
  | "terraced"
  | "flat"
  | "bungalow";

/**
 * Property tenure types
 */
export type PropertyTenure = "freehold" | "leasehold" | "commonhold";

/**
 * Document categories
 */
export type DocumentCategory =
  | "title_deeds"
  | "epc"
  | "property_information_form"
  | "searches"
  | "leasehold_info"
  | "mortgage_info"
  | "other";

/**
 * Address interface
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Generic sort parameters
 */
export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Generic filter interface
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Date range filter
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * File information interface
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Upload progress information
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: "pending" | "uploading" | "completed" | "error";
}

/**
 * Generic key-value pair
 */
export interface KeyValuePair {
  key: string;
  value: string;
}

/**
 * Environment configuration
 */
export interface Environment {
  API_BASE_URL: string;
  WS_BASE_URL: string;
  NODE_ENV: "development" | "production" | "test";
}
