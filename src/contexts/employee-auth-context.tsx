'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EmployeeAuthAPI } from '@/modules/employee-auth';
import type { 
  EmployeeUser, 
  EmployeeLoginCredentials, 
  EmployeeAuthContextType 
} from '@/modules/employee-auth';

interface EmployeeAuthProviderProps {
  children: ReactNode;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType | undefined>(undefined);

export const useEmployeeAuth = (): EmployeeAuthContextType => {
  const context = useContext(EmployeeAuthContext);
  if (context === undefined) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
};

export const EmployeeAuthProvider: React.FC<EmployeeAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<EmployeeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize authentication state from localStorage with employee prefix
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('employee-auth-token');
        const userData = localStorage.getItem('employee-auth-user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          // Validate user data structure
          if (user && user.id && user.email && user.full_name) {
            setUser(user);
            setToken(token);
            setIsAuthenticated(true);
            console.log('Restored employee authentication:', user.full_name);
          } else {
            console.warn('Invalid employee user data in localStorage');
            // Clear invalid data
            localStorage.removeItem('employee-auth-token');
            localStorage.removeItem('employee-auth-user');
          }
        }
      } catch (error) {
        console.error('Error parsing employee user data from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('employee-auth-token');
        localStorage.removeItem('employee-auth-user');
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, []);

  // Helper function to check if user has a specific role
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // Helper function to check if user has a specific permission
  const can = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Helper function to check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  // Helper function to check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  // Helper function to check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  // Login function for employees
  const login = async (credentials: EmployeeLoginCredentials): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting employee login with email:', credentials.email);
      
      // Call the new API
      const response = await EmployeeAuthAPI.login(credentials);
      
      const userData = response.data.user;
      const authToken = response.data.token;
      
      // Store in state
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      
      // Store in localStorage with employee prefix
      localStorage.setItem('employee-auth-token', authToken);
      localStorage.setItem('employee-auth-user', JSON.stringify(userData));
      
      console.log('Employee login successful:', { 
        user: userData.full_name, 
        roles: userData.roles,
        permissions: userData.permissions.length 
      });
    } catch (error) {
      console.error('Employee login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function for employees
  const logout = async (): Promise<void> => {
    try {
      // Call backend logout if token exists
      if (token) {
        await EmployeeAuthAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Clear localStorage with employee prefix
      localStorage.removeItem('employee-auth-token');
      localStorage.removeItem('employee-auth-user');
    }
  };

  // Function to get current token
  const getToken = (): string | null => {
    return token;
  };

  // Function to check if token is valid
  const isTokenValid = (): boolean => {
    return !!token && isAuthenticated;
  };

  const value: EmployeeAuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    isHydrated,
    login,
    logout,
    getToken,
    isTokenValid,
    hasRole,
    can,
    hasAnyRole,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};

