// src/hooks/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthContext';

/**
 * Custom hook for accessing authentication state and actions
 *
 * This hook provides access to:
 * - User authentication state
 * - Authentication actions (login, logout, register, etc.)
 * - Permission checking utilities
 * - Role-based access control helpers
 *
 * @returns {UseAuthReturn} Authentication state and actions
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (credentials) => {
 *     try {
 *       await login(credentials);
 *       // Redirect or update UI
 *     } catch (error) {
 *       // Handle login error
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <div className="error">{error}</div>}
 *       // Form fields...
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ProtectedComponent() {
 *   const { hasPermission, hasRole, user } = useAuth();
 *
 *   if (!hasPermission('document:read')) {
 *     return <div>Access denied</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h1>Welcome {user?.firstName}!</h1>
 *       {hasRole('agent') && (
 *         <button>Manage Properties</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
