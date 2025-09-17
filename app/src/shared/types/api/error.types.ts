// Error handling types for API responses

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories for classification
 */
export type ErrorType = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'server_error'
  | 'network_error'
  | 'timeout'
  | 'unknown';

/**
 * Base error interface
 */
export interface BaseError {
  code: string;
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
}

/**
 * API error response structure
 */
export interface ApiError extends BaseError {
  details?: Record<string, any>;
  field?: string;
  statusCode: number;
  requestId?: string;
}

/**
 * Validation error for form fields
 */
export interface ValidationError extends BaseError {
  type: 'validation';
  field: string;
  value?: any;
  constraints: string[];
}

/**
 * Multiple validation errors
 */
export interface ValidationErrorResponse {
  success: false;
  errors: ValidationError[];
  message: string;
}

/**
 * Network error information
 */
export interface NetworkError {
  type: 'network_error';
  message: string;
  isOffline: boolean;
  retryable: boolean;
  retryAfter?: number;
}

/**
 * Timeout error
 */
export interface TimeoutError extends BaseError {
  type: 'timeout';
  duration: number;
  endpoint: string;
}

/**
 * Rate limit error
 */
export interface RateLimitError extends BaseError {
  type: 'rate_limit';
  limit: number;
  remaining: number;
  resetTime: string;
}

/**
 * Union type for all possible errors
 */
export type AppError = 
  | ApiError 
  | ValidationError 
  | NetworkError 
  | TimeoutError 
  | RateLimitError;

/**
 * Error handler function type
 */
export type ErrorHandler = (error: AppError) => void;

/**
 * Error recovery strategy
 */
export interface ErrorRecovery {
  retryable: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackData?: any;
}