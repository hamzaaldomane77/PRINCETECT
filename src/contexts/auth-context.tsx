'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, LoginResponse, AuthContextType } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state from localStorage
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('auth-user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setToken(token);
          setIsAuthenticated(true);
          console.log('Restored authentication from localStorage:', { user, token });
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          // Clear invalid data
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }
      }
    }
    setIsLoading(false);
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

  // Login function - Updated to work with real API
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    
    try {
      // For login, we don't need authentication headers, so use fetch directly
      let response: Response;
      
      try {
        // Try the admin login endpoint first
        console.log('Attempting to connect via proxy to:', 'admin/auth/login');
        console.log('With credentials:', { email: credentials.email });
        
        response = await fetch('/api/proxy/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            ...credentials,
            endpoint: 'admin/auth/login'
          }),
        });
        
        console.log('Response received:', response.status, response.statusText);
      } catch (fetchError) {
        console.error('Fetch error details:', fetchError);
        throw new Error('لا يمكن الاتصال بالخادم، تحقق من اتصال الإنترنت');
      }

      // If admin login fails, try regular login
      if (!response.ok && response.status === 404) {
        try {
          console.log('Admin login failed, trying regular login...');
          response = await fetch('/api/proxy/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              ...credentials,
              endpoint: 'auth/login'
            }),
          });
          console.log('Regular login response:', response.status, response.statusText);
        } catch (fetchError) {
          console.error('Regular login fetch error:', fetchError);
          throw new Error('لا يمكن الاتصال بالخادم، تحقق من اتصال الإنترنت');
        }
      }

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 401) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (response.status === 404) {
          throw new Error('خادم تسجيل الدخول غير متاح');
        } else if (response.status === 500) {
          throw new Error('خطأ في الخادم، يرجى المحاولة لاحقاً');
        } else if (response.status === 0) {
          throw new Error('لا يمكن الاتصال بالخادم، تحقق من اتصال الإنترنت');
        } else {
          throw new Error(`فشل في تسجيل الدخول (${response.status})`);
        }
      }

      const data: LoginResponse = await response.json();
      
      if (data.success && data.data.user) {
        const userData = data.data.user;
        const authToken = data.data.token;
        
        // Store in state
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem('auth-token', authToken);
        localStorage.setItem('auth-user', JSON.stringify(userData));
        
        console.log('Login successful:', { user: userData, token: authToken });
      } else {
        throw new Error('استجابة غير صحيحة من الخادم');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('خطأ في الاتصال بالخادم، تحقق من اتصال الإنترنت');
      }
      
      // Re-throw the error with the message
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
  };

  // Function to get current token
  const getToken = (): string | null => {
    return token;
  };

  // Function to check if token is valid
  const isTokenValid = (): boolean => {
    return !!token && isAuthenticated;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
