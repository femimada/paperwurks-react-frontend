// User role definitions and permissions

import type { UserRole, Permission } from '@/shared/types/global.types';

/**
 * User roles with descriptions
 */
export const USER_ROLES: Record<
  UserRole,
  { label: string; description: string }
> = {
  owner: {
    label: 'Property Owner',
    description: 'Property owner who creates and manages property packs',
  },
  agent: {
    label: 'Estate Agent',
    description:
      'Estate agent who coordinates between parties and manages client properties',
  },
  solicitor: {
    label: 'Solicitor',
    description:
      'Legal professional who reviews documents and provides risk assessments',
  },
  buyer: {
    label: 'Prospective Buyer',
    description: 'Potential buyer with limited access to shared property packs',
  },
} as const;

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'property:create',
    'property:read',
    'property:update',
    'property:delete',
    'document:upload',
    'document:read',
    'document:annotate',
  ],
  agent: [
    'property:create',
    'property:read',
    'property:update',
    'document:upload',
    'document:read',
    'document:annotate',
    'pack:share',
    'user:manage',
  ],
  solicitor: [
    'property:read',
    'document:read',
    'document:annotate',
    'pack:review',
  ],
  buyer: ['property:read', 'document:read'],
} as const;

/**
 * Role hierarchy for access control
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  buyer: 1,
  owner: 2,
  solicitor: 3,
  agent: 4,
} as const;

/**
 * Default role for new users
 */
export const DEFAULT_ROLE: UserRole = 'owner';
