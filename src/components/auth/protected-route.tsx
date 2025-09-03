'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  fallback = null,
  redirectTo = '/403',
}) => {
  const { user, isAuthenticated, isLoading, hasRole, can, hasAnyRole, hasAnyPermission, hasAllPermissions } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/');
      return;
    }

    // Check roles if specified
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      router.push(redirectTo);
      return;
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
      let hasAccess = false;
      
      if (requireAllPermissions) {
        hasAccess = hasAllPermissions(requiredPermissions);
      } else {
        hasAccess = hasAnyPermission(requiredPermissions);
      }

      if (!hasAccess) {
        router.push(redirectTo);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, requiredPermissions, requireAllPermissions, hasRole, can, hasAnyRole, hasAnyPermission, hasAllPermissions, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show fallback while checking permissions
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // Check roles
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallback;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    let hasAccess = false;
    
    if (requireAllPermissions) {
      hasAccess = hasAllPermissions(requiredPermissions);
    } else {
      hasAccess = hasAnyPermission(requiredPermissions);
    }

    if (!hasAccess) {
      return fallback;
    }
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const SuperAdminOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['super_admin']}>
    {children}
  </ProtectedRoute>
);

export const WithPermission: React.FC<{ 
  children: ReactNode; 
  permission: string;
  requireAll?: boolean;
}> = ({ children, permission, requireAll = false }) => (
  <ProtectedRoute 
    requiredPermissions={[permission]} 
    requireAllPermissions={requireAll}
  >
    {children}
  </ProtectedRoute>
);

export const WithAnyPermission: React.FC<{ 
  children: ReactNode; 
  permissions: string[];
}> = ({ children, permissions }) => (
  <ProtectedRoute requiredPermissions={permissions}>
    {children}
  </ProtectedRoute>
); 