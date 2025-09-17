// Application route paths

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SHARED_PACK: '/shared/:token',
} as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = {
  // Dashboard routes
  DASHBOARD: '/dashboard',

  // Property routes
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: '/properties/:id',
  PROPERTY_CREATE: '/properties/create',
  PROPERTY_EDIT: '/properties/:id/edit',

  // Document routes
  DOCUMENTS: '/properties/:propertyId/documents',
  DOCUMENT_UPLOAD: '/properties/:propertyId/documents/upload',
  DOCUMENT_VIEWER: '/documents/:id',

  // Notification routes
  NOTIFICATIONS: '/notifications',

  // Settings routes
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',

  // Sharing routes
  SHARE_PACK: '/properties/:id/share',
} as const;

/**
 * Error routes
 */
export const ERROR_ROUTES = {
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  UNAUTHORIZED: '/unauthorized',
} as const;

/**
 * All routes combined
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...ERROR_ROUTES,
} as const;

/**
 * Route parameter builders
 */
export const buildRoute = {
  propertyDetail: (id: string) => `/properties/${id}`,
  propertyEdit: (id: string) => `/properties/${id}/edit`,
  propertyDocuments: (propertyId: string) =>
    `/properties/${propertyId}/documents`,
  documentUpload: (propertyId: string) =>
    `/properties/${propertyId}/documents/upload`,
  documentViewer: (id: string) => `/documents/${id}`,
  shareProperty: (id: string) => `/properties/${id}/share`,
  sharedPack: (token: string) => `/shared/${token}`,
} as const;
