// Global utility constants

/**
 * Application information
 */
export const APP_INFO = {
  NAME: 'Paperwurks',
  VERSION: '1.0.0',
  DESCRIPTION: 'Property due diligence platform',
} as const;

/**
 * File upload constraints
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for upload
} as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  POSTCODE_REGEX: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * UI constants
 */
export const UI = {
  TOAST_DURATION: 5000, // 5 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  PAGINATION_DEFAULT_LIMIT: 20,
  SIDEBAR_WIDTH: 256, // pixels
  HEADER_HEIGHT: 64, // pixels
} as const;

/**
 * Date and time constants
 */
export const DATE_TIME = {
  DEFAULT_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  ISO_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * Network and retry constants
 */
export const NETWORK = {
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRIES: 3,
  TIMEOUT: 30000, // 30 seconds
} as const;
