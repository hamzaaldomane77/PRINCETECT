'use client';

import React, { ReactNode, useEffect } from 'react';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { useRouter } from 'next/navigation';

interface EmployeeProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const EmployeeProtectedRoute: React.FC<EmployeeProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  fallback = null,
  redirectTo = '/403',
}) => {
  const { user, isAuthenticated, isLoading, hasRole, can, hasAnyRole, hasAnyPermission, hasAllPermissions } = useEmployeeAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/employee/login');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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

// Convenience component for employees with specific permission
export const WithEmployeePermission: React.FC<{ 
  children: ReactNode; 
  permission: string;
  requireAll?: boolean;
}> = ({ children, permission, requireAll = false }) => (
  <EmployeeProtectedRoute 
    requiredPermissions={[permission]} 
    requireAllPermissions={requireAll}
  >
    {children}
  </EmployeeProtectedRoute>
);

// Convenience component for employees with any of the specified permissions
export const WithAnyEmployeePermission: React.FC<{ 
  children: ReactNode; 
  permissions: string[];
}> = ({ children, permissions }) => (
  <EmployeeProtectedRoute requiredPermissions={permissions}>
    {children}
  </EmployeeProtectedRoute>
);

