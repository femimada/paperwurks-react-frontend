// Status constants for various entities

import type {
  PropertyStatus,
  DocumentStatus,
  PackStatus,
  Status,
} from '@/types/global.types';

/**
 * Property status definitions
 */
export const PROPERTY_STATUSES: Record<
  PropertyStatus,
  { label: string; color: string }
> = {
  draft: {
    label: 'Draft',
    color: 'neutral',
  },
  in_progress: {
    label: 'In Progress',
    color: 'warning',
  },
  ready: {
    label: 'Ready',
    color: 'success',
  },
  shared: {
    label: 'Shared',
    color: 'info',
  },
  completed: {
    label: 'Completed',
    color: 'success',
  },
} as const;

/**
 * Document status definitions
 */
export const DOCUMENT_STATUSES: Record<
  DocumentStatus,
  { label: string; color: string }
> = {
  uploading: {
    label: 'Uploading',
    color: 'warning',
  },
  processing: {
    label: 'Processing',
    color: 'warning',
  },
  ready: {
    label: 'Ready',
    color: 'success',
  },
  error: {
    label: 'Error',
    color: 'error',
  },
} as const;

/**
 * Pack status definitions
 */
export const PACK_STATUSES: Record<
  PackStatus,
  { label: string; color: string }
> = {
  draft: {
    label: 'Draft',
    color: 'neutral',
  },
  in_progress: {
    label: 'In Progress',
    color: 'warning',
  },
  ready: {
    label: 'Ready',
    color: 'success',
  },
  shared: {
    label: 'Shared',
    color: 'info',
  },
  completed: {
    label: 'Completed',
    color: 'success',
  },
} as const;

/**
 * Generic status definitions
 */
export const GENERIC_STATUSES: Record<
  Status,
  { label: string; color: string }
> = {
  active: {
    label: 'Active',
    color: 'success',
  },
  inactive: {
    label: 'Inactive',
    color: 'neutral',
  },
  pending: {
    label: 'Pending',
    color: 'warning',
  },
  archived: {
    label: 'Archived',
    color: 'neutral',
  },
} as const;

/**
 * Status progression order for properties
 */
export const PROPERTY_STATUS_ORDER: PropertyStatus[] = [
  'draft',
  'in_progress',
  'ready',
  'shared',
  'completed',
];

/**
 * Status progression order for documents
 */
export const DOCUMENT_STATUS_ORDER: DocumentStatus[] = [
  'uploading',
  'processing',
  'ready',
];

/**
 * Status progression order for packs
 */
export const PACK_STATUS_ORDER: PackStatus[] = [
  'draft',
  'in_progress',
  'ready',
  'shared',
  'completed',
];
