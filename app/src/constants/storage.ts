// Local storage keys and configuration

/**
 * Local storage keys for persistent data
 */
export const LOCAL_STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'paperwurks_auth_token',
  REFRESH_TOKEN: 'paperwurks_refresh_token',
  USER_PROFILE: 'paperwurks_user_profile',

  // User preferences
  THEME: 'paperwurks_theme',
  LANGUAGE: 'paperwurks_language',
  NOTIFICATION_SETTINGS: 'paperwurks_notifications',

  // Application state
  RECENTLY_VIEWED_PROPERTIES: 'paperwurks_recent_properties',
  RECENTLY_VIEWED_DOCUMENTS: 'paperwurks_recent_documents',

  // Form drafts
  PROPERTY_FORM_DRAFT: 'paperwurks_property_draft',
  USER_SETTINGS_DRAFT: 'paperwurks_settings_draft',
} as const;

/**
 * Session storage keys for temporary data
 */
export const SESSION_STORAGE_KEYS = {
  // Upload state
  UPLOAD_PROGRESS: 'paperwurks_upload_progress',
  UPLOAD_QUEUE: 'paperwurks_upload_queue',

  // Form wizard state
  PROPERTY_WIZARD_STATE: 'paperwurks_property_wizard',

  // Search and filters
  PROPERTY_FILTERS: 'paperwurks_property_filters',
  DOCUMENT_FILTERS: 'paperwurks_document_filters',

  // Navigation state
  LAST_VISITED_PROPERTY: 'paperwurks_last_property',
  BREADCRUMB_STATE: 'paperwurks_breadcrumbs',
} as const;

/**
 * Storage configuration
 */
export const STORAGE_CONFIG = {
  // Expiration times (in milliseconds)
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  DRAFT_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  RECENT_ITEMS_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Maximum items in lists
  MAX_RECENT_PROPERTIES: 10,
  MAX_RECENT_DOCUMENTS: 20,
  MAX_UPLOAD_QUEUE: 50,

  // Data size limits
  MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;
