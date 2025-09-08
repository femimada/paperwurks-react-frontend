// API response structures and common types

import type { PaginationMeta } from "../global.types";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

/**
 * API response metadata
 */
export interface ResponseMeta {
  pagination?: PaginationMeta;
  timestamp: string;
  version: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * File upload response
 */
export interface UploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  auth?: boolean;
}

/**
 * Request query parameters
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}
