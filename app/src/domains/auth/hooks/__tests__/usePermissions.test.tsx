// src/domains/auth/hooks/__tests__/usePermissions.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { useAuth } from '../useAuth';
import type { User } from '@/domains/auth/types';
import type { Permission, UserRole } from '@/shared/types/global.types';

// Mock useAuth hook
vi.mock('../useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Mock ROLE_PERMISSIONS constant
vi.mock('@/shared/constants/roles', () => ({
  ROLE_PERMISSIONS: {
    buyer: ['property:read'],
    owner: ['property:read', 'property:write'],
    solicitor: ['property:read', 'property:write', 'document:review'],
    agent: [
      'property:read',
      'property:write',
      'property:manage',
      'user:manage',
    ],
  },
}));

describe('usePermissions', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'owner',
    permissions: ['property:read', 'property:create'],
    profile: { phone: '', bio: '' },
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default useAuth mock
    mockUseAuth.mockReturnValue({
      user: mockUser,
      permissions: ['property:read', 'property:create'],
      hasPermission: vi.fn((perm) => mockUser.permissions.includes(perm)),
      hasRole: vi.fn((role) => mockUser.role === role),
      hasAnyPermission: vi.fn((perms) =>
        perms.some((p) => mockUser.permissions.includes(p))
      ),
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      changePassword: vi.fn(),
      updateProfile: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      clearError: vi.fn(),
    });
  });

  describe('Basic Permission Utilities', () => {
    it('should provide basic permission functions from useAuth', () => {
      const { result } = renderHook(() => usePermissions());

      expect(typeof result.current.hasPermission).toBe('function');
      expect(typeof result.current.hasRole).toBe('function');
      expect(typeof result.current.hasAnyPermission).toBe('function');
      expect(typeof result.current.isRole).toBe('function');
      expect(result.current.isRole).toBe(result.current.hasRole);
    });
  });

  describe('getRolePermissions', () => {
    it('should return correct permissions for each role', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.getRolePermissions('buyer')).toEqual([
        'property:read',
      ]);
      expect(result.current.getRolePermissions('owner')).toEqual([
        'property:read',
        'property:write',
      ]);
      expect(result.current.getRolePermissions('solicitor')).toEqual([
        'property:read',
        'property:write',
        'document:review',
      ]);
      expect(result.current.getRolePermissions('agent')).toEqual([
        'property:read',
        'property:write',
        'property:manage',
        'user:manage',
      ]);
    });

    it('should return empty array for unknown role', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.getRolePermissions('unknown' as UserRole)).toEqual(
        []
      );
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPermissions(['property:read'])).toBe(true);
      expect(
        result.current.hasAllPermissions(['property:read', 'property:create'])
      ).toBe(true);
      expect(result.current.hasAllPermissions([])).toBe(true);
    });

    it('should return false when user is missing some permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPermissions(['property:read'])).toBe(false);
      expect(result.current.hasAllPermissions(['user:manage'])).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should return granted result when user has all permissions', () => {
      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermission(['property:read']);

      expect(checkResult.granted).toBe(true);
      expect(checkResult.reason).toBe('Permission granted');
      expect(checkResult.requiredPermissions).toEqual(['property:read']);
      expect(checkResult.missingPermissions).toEqual([]);
    });

    it('should return denied result when user is missing permissions', () => {
      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermission([
        'property:read',
        'user:manage',
      ]);

      expect(checkResult.granted).toBe(false);
      expect(checkResult.reason).toBe('Missing permissions: user:manage');
      expect(checkResult.requiredPermissions).toEqual([
        'property:read',
        'user:manage',
      ]);
      expect(checkResult.missingPermissions).toEqual(['user:manage']);
    });

    it('should handle multiple missing permissions', () => {
      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermission([
        'user:manage',
        'property:read',
      ]);

      expect(checkResult.granted).toBe(false);
      expect(checkResult.reason).toBe(
        'Missing permissions: user:manage, document:review'
      );
      expect(checkResult.missingPermissions).toEqual([
        'user:manage',
        'document:review',
      ]);
    });
  });

  describe('canAccessResource', () => {
    it('should grant access when user role is equal or higher', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'agent' },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessResource('buyer')).toBe(true);
      expect(result.current.canAccessResource('owner')).toBe(true);
      expect(result.current.canAccessResource('solicitor')).toBe(true);
      expect(result.current.canAccessResource('agent')).toBe(true);
    });

    it('should deny access when user role is lower', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'buyer' },
        permissions: ['property:read'],
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessResource('owner')).toBe(false);
      expect(result.current.canAccessResource('solicitor')).toBe(false);
      expect(result.current.canAccessResource('agent')).toBe(false);
    });

    it('should check required permissions in addition to role', () => {
      const { result } = renderHook(() => usePermissions());

      // Owner role trying to access buyer resource with additional permission requirement
      expect(result.current.canAccessResource('buyer', ['property:read'])).toBe(
        true
      );
      expect(result.current.canAccessResource('buyer', ['user:manage'])).toBe(
        false
      );
    });

    it('should return false when user is null', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: null,
        permissions: [],
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessResource('buyer')).toBe(false);
    });
  });

  describe('effectivePermissions', () => {
    it('should combine role permissions and user permissions', () => {
      // User has owner role permissions + additional document:review permission
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        permissions: ['property:read', 'property:create'],
      });

      const { result } = renderHook(() => usePermissions());

      const effective = result.current.effectivePermissions;
      expect(effective).toContain('property:read');
      expect(effective).toContain('property:write');
      expect(effective).toContain('document:review');
      expect(effective.length).toBe(3); // No duplicates
    });

    it('should deduplicate permissions', () => {
      // Role and user permissions overlap
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'owner' },
        permissions: ['property:read', 'property:create'], // Same as role permissions
      });

      const { result } = renderHook(() => usePermissions());

      const effective = result.current.effectivePermissions;
      expect(effective.filter((p) => p === 'property:read')).toHaveLength(1);
      expect(effective.filter((p) => p === 'property:create')).toHaveLength(1);
    });

    it('should return empty array when user is null', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: null,
        permissions: [],
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.effectivePermissions).toEqual([]);
    });
  });

  describe('hasElevatedPermissions', () => {
    it('should return true when user has permissions beyond their role', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'owner' },
        permissions: ['property:read', 'property:create', 'user:manage'], // user:manage is beyond owner role
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasElevatedPermissions).toBe(true);
    });

    it('should return false when user only has role permissions', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'owner' },
        permissions: ['property:read', 'property:create'], // Exactly owner role permissions
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasElevatedPermissions).toBe(false);
    });

    it('should return false when user has subset of role permissions', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: { ...mockUser, role: 'owner' },
        permissions: ['property:read'], // Less than owner role permissions
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasElevatedPermissions).toBe(false);
    });

    it('should return false when user is null', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: null,
        permissions: [],
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasElevatedPermissions).toBe(false);
    });
  });

  describe('getMissingPermissionsForRole', () => {
    it('should return permissions missing for target role', () => {
      // Owner user trying to get agent role permissions
      const { result } = renderHook(() => usePermissions());

      const missing = result.current.getMissingPermissionsForRole('agent');
      expect(missing).toEqual(['property:manage', 'user:manage']);
    });

    it('should return empty array when user has all target role permissions', () => {
      const { result } = renderHook(() => usePermissions());

      const missing = result.current.getMissingPermissionsForRole('buyer');
      expect(missing).toEqual([]);
    });

    it('should work with user having elevated permissions', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        permissions: [
          'property:read',
          'property:write',
          'document:review',
          'user:manage',
        ],
      });

      const { result } = renderHook(() => usePermissions());

      const missing = result.current.getMissingPermissionsForRole('agent');
      expect(missing).toEqual(['property:manage']);
    });
  });

  describe('Current User Context', () => {
    it('should provide current role and permissions', () => {
      const { result } = renderHook(() => usePermissions());

      expect(result.current.currentRole).toBe('owner');
      expect(result.current.currentPermissions).toEqual([
        'property:read',
        'property:write',
      ]);
    });

    it('should handle null user', () => {
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        user: null,
        permissions: [],
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.currentRole).toBeUndefined();
      expect(result.current.currentPermissions).toEqual([]);
    });
  });

  describe('Hook Stability', () => {
    it('should memoize callback functions', () => {
      const { result, rerender } = renderHook(() => usePermissions());

      const firstRolePermissions = result.current.getRolePermissions;
      const firstHasAllPermissions = result.current.hasAllPermissions;
      const firstCheckPermission = result.current.checkPermission;

      rerender();

      expect(result.current.getRolePermissions).toBe(firstRolePermissions);
      expect(result.current.hasAllPermissions).toBe(firstHasAllPermissions);
      expect(result.current.checkPermission).toBe(firstCheckPermission);
    });

    it('should update memoized values when dependencies change', () => {
      const { result, rerender } = renderHook(() => usePermissions());

      const firstEffectivePermissions = result.current.effectivePermissions;

      // Change user permissions
      mockUseAuth.mockReturnValue({
        ...mockUseAuth(),
        permissions: ['property:read', 'property:write', 'document:review'],
      });

      rerender();

      expect(result.current.effectivePermissions).not.toBe(
        firstEffectivePermissions
      );
      expect(result.current.effectivePermissions).toContain('document:review');
    });
  });
});
