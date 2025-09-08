// API endpoints and configuration constants

/**
 * API base configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    DETAIL: (id: string) => `/properties/${id}`,
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    TIMELINE: (id: string) => `/properties/${id}/timeline`,
  },

  // Property Packs
  PACKS: {
    DETAIL: (id: string) => `/packs/${id}`,
    UPDATE: (id: string) => `/packs/${id}`,
    PROGRESS: (id: string) => `/packs/${id}/progress`,
    SHARE: (id: string) => `/packs/${id}/share`,
  },

  // Documents
  DOCUMENTS: {
    LIST: (packId: string) => `/packs/${packId}/documents`,
    UPLOAD: (packId: string) => `/packs/${packId}/documents`,
    DETAIL: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // Sharing
  SHARING: {
    CREATE_LINK: (packId: string) => `/packs/${packId}/share-link`,
    REVOKE_LINK: (packId: string) => `/packs/${packId}/revoke-link`,
    SHARED_PACK: (token: string) => `/shared/${token}`,
  },
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
