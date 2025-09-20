// src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw';
import type {
  AuthResponse,
  RefreshTokenRequest,
  User,
} from '@/domains/auth/types';

import type { LoginFormData as LoginRequest } from '@/domains/auth/utils/validation/authSchema';
import type { RegisterFormData as RegisterRequest } from '@/domains/auth/utils/validation/authSchema';

// Mock user database - exactly matching the User interface
const mockUsers: User[] = [
  {
    id: '1',
    email: 'owner@test.com',
    firstName: 'John',
    lastName: 'Owner',
    role: 'owner',
    permissions: [
      'property:create',
      'property:read',
      'property:update',
      'property:delete',
      'document:upload',
      'document:read',
      'document:annotate',
    ],
    profile: {
      phone: '+44 7700 900123',
      bio: 'Property owner looking to streamline due diligence',
    },
    isEmailVerified: true,
    lastLoginAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'agent@test.com',
    firstName: 'Jane',
    lastName: 'Agent',
    role: 'agent',
    organization: {
      id: '1',
      name: 'Premium Estate Agents',
      type: 'estate_agency',
      address: '123 High Street, London',
      website: 'https://premiumestates.co.uk',
    },
    permissions: [
      'property:create',
      'property:read',
      'property:update',
      'document:upload',
      'document:read',
      'document:annotate',
      'pack:share',
      'user:manage',
    ],
    profile: {
      phone: '+44 7700 900124',
      bio: 'Experienced estate agent specializing in residential properties',
    },
    isEmailVerified: true,
    lastLoginAt: new Date('2024-01-14'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'solicitor@test.com',
    firstName: 'Robert',
    lastName: 'Solicitor',
    role: 'solicitor',
    organization: {
      id: '2',
      name: 'Legal Partners LLP',
      type: 'law_firm',
      address: '456 Legal Street, Manchester',
      website: 'https://legalpartners.co.uk',
    },
    permissions: [
      'property:read',
      'document:read',
      'document:annotate',
      'pack:review',
    ],
    profile: {
      phone: '+44 7700 900125',
      bio: 'Qualified solicitor with 15 years property law experience',
    },
    isEmailVerified: true,
    lastLoginAt: new Date('2024-01-13'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    email: 'buyer@test.com',
    firstName: 'Sarah',
    lastName: 'Buyer',
    role: 'buyer',
    permissions: ['property:read', 'document:read'],
    profile: {
      phone: '+44 7700 900126',
      bio: 'First-time buyer looking for the perfect home',
    },
    isEmailVerified: true,
    lastLoginAt: new Date('2024-01-12'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock tokens store (in production this would be server-side)
const mockTokens = new Map<string, { userId: string; expires: Date }>();

// Helper functions
const generateToken = (length: number = 32): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createAuthResponse = (user: User): AuthResponse => {
  const accessToken = generateToken(64);
  const refreshToken = generateToken(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store refresh token
  mockTokens.set(refreshToken, {
    userId: user.id,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
      tokenType: 'Bearer',
    },
  };
};

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

    const body = (await request.json()) as LoginRequest;
    const { email } = body;

    // Find user
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            type: 'authentication',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // Update last login time
    user.lastLoginAt = new Date();

    const authResponse = createAuthResponse(user);

    return HttpResponse.json({
      success: true,
      data: authResponse,
      message: 'Login successful',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Register
  http.post('/api/auth/register', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const body = (await request.json()) as RegisterRequest;
    const { email, firstName, lastName, role } = body;

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
            type: 'conflict',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // Create new user - exactly matching User interface
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      firstName,
      lastName,
      role,
      permissions:
        role === 'owner'
          ? [
              'property:create',
              'property:read',
              'property:update',
              'property:delete',
              'document:upload',
              'document:read',
              'document:annotate',
            ]
          : role === 'agent'
            ? [
                'property:create',
                'property:read',
                'property:update',
                'document:upload',
                'document:read',
                'document:annotate',
                'pack:share',
                'user:manage',
              ]
            : role === 'solicitor'
              ? [
                  'property:read',
                  'document:read',
                  'document:annotate',
                  'pack:review',
                ]
              : ['property:read', 'document:read'],
      profile: {
        phone: '',
        bio: '',
      },
      isEmailVerified: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);
    const authResponse = createAuthResponse(newUser);

    return HttpResponse.json({
      success: true,
      data: authResponse,
      message: 'Registration successful',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Refresh token
  http.post('/api/auth/refresh', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const body = (await request.json()) as RefreshTokenRequest;
    const { refreshToken } = body;

    const tokenData = mockTokens.get(refreshToken);
    if (!tokenData || tokenData.expires < new Date()) {
      mockTokens.delete(refreshToken);
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token',
            type: 'authentication',
            severity: 'high',
            timestamp: new Date().toISOString(),
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    const user = mockUsers.find((u) => u.id === tokenData.userId);
    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            type: 'not_found',
            severity: 'high',
            timestamp: new Date().toISOString(),
            statusCode: 404,
          },
        },
        { status: 404 }
      );
    }

    // Remove old refresh token
    mockTokens.delete(refreshToken);

    const authResponse = createAuthResponse(user);

    return HttpResponse.json({
      success: true,
      data: authResponse,
      message: 'Token refreshed successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Logout
  http.post('/api/auth/logout', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authorization token required',
            type: 'authentication',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // In a real implementation, we'd invalidate the token on the server
    // For mock purposes, we'll just return success
    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Logged out successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Get current user profile
  http.get('/api/users/profile', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'Authorization token required',
            type: 'authentication',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // For mock purposes, return the first user (in real app, decode JWT)
    const user = mockUsers[0];

    return HttpResponse.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Forgot password
  http.post('/api/auth/forgot-password', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const body = (await request.json()) as { email: string };
    const { email } = body;

    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return HttpResponse.json({
        success: true,
        data: null,
        message:
          'If an account with this email exists, a password reset link has been sent',
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Password reset link sent to your email',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Reset password
  http.post('/api/auth/reset-password', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const body = (await request.json()) as { token: string; password: string };
    const { token } = body;

    // Mock token validation (in real app, verify JWT token)
    if (token !== 'valid-reset-token') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token',
            type: 'authentication',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Password reset successful',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),
];
