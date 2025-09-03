'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface PermissionWrapperProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  role?: string;
  roles?: string[];
  requireAnyRole?: boolean;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  role,
  roles,
  requireAnyRole = true,
}) => {
  const { hasRole, can, hasAnyRole, hasAnyPermission, hasAllPermissions } = useAuth();

  // Check roles if specified
  if (role || roles) {
    const rolesToCheck = roles || (role ? [role] : []);
    
    if (requireAnyRole) {
      if (!hasAnyRole(rolesToCheck)) {
        return fallback;
      }
    } else {
      // Require all roles
      if (!rolesToCheck.every(r => hasRole(r))) {
        return fallback;
      }
    }
  }

  // Check permissions if specified
  if (permission || permissions) {
    const permissionsToCheck = permissions || (permission ? [permission] : []);
    
    if (requireAll) {
      if (!hasAllPermissions(permissionsToCheck)) {
        return fallback;
      }
    } else {
      // Require any permission
      if (!hasAnyPermission(permissionsToCheck)) {
        return fallback;
      }
    }
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const Can: React.FC<{ 
  children: ReactNode; 
  permission: string;
  fallback?: ReactNode;
}> = ({ children, permission, fallback }) => (
  <PermissionWrapper permission={permission} fallback={fallback}>
    {children}
  </PermissionWrapper>
);

export const CanAny: React.FC<{ 
  children: ReactNode; 
  permissions: string[];
  fallback?: ReactNode;
}> = ({ children, permissions, fallback }) => (
  <PermissionWrapper permissions={permissions} fallback={fallback}>
    {children}
  </PermissionWrapper>
);

export const CanAll: React.FC<{ 
  children: ReactNode; 
  permissions: string[];
  fallback?: ReactNode;
}> = ({ children, permissions, fallback }) => (
  <PermissionWrapper permissions={permissions} requireAll fallback={fallback}>
    {children}
  </PermissionWrapper>
);

export const HasRole: React.FC<{ 
  children: ReactNode; 
  role: string;
  fallback?: ReactNode;
}> = ({ children, role, fallback }) => (
  <PermissionWrapper role={role} fallback={fallback}>
    {children}
  </PermissionWrapper>
);

export const HasAnyRole: React.FC<{ 
  children: ReactNode; 
  roles: string[];
  fallback?: ReactNode;
}> = ({ children, roles, fallback }) => (
  <PermissionWrapper roles={roles} fallback={fallback}>
    {children}
  </PermissionWrapper>
);

export const HasAllRoles: React.FC<{ 
  children: ReactNode; 
  roles: string[];
  fallback?: ReactNode;
}> = ({ children, roles, fallback }) => (
  <PermissionWrapper roles={roles} requireAnyRole={false} fallback={fallback}>
    {children}
  </PermissionWrapper>
);
