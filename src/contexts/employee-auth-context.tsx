'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, LoginResponse, AuthContextType } from '@/types/auth';

interface EmployeeAuthProviderProps {
  children: ReactNode;
}

const EmployeeAuthContext = createContext<AuthContextType | undefined>(undefined);

export const useEmployeeAuth = (): AuthContextType => {
  const context = useContext(EmployeeAuthContext);
  if (context === undefined) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
};

export const EmployeeAuthProvider: React.FC<EmployeeAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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
          setUser(user);
          setToken(token);
          setIsAuthenticated(true);
          console.log('Restored employee authentication from localStorage:', { user, token });
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
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Demo login credentials for testing (until backend is connected)
      const DEMO_CREDENTIALS = {
        email: 'employee@demo.com',
        password: 'employee123'
      };

      // Check if using demo credentials
      const isDemoLogin = credentials.email === DEMO_CREDENTIALS.email && 
                         credentials.password === DEMO_CREDENTIALS.password;

      if (isDemoLogin) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create demo user data
        const demoUser: User = {
          id: 100,
          email: 'employee@demo.com',
          name: 'موظف تجريبي',
          roles: ['employee'],
          permissions: ['view_tasks', 'view_meetings', 'view_clients'],
        };
        const demoToken = 'demo-employee-token-' + Date.now();

        // Store in state
        setUser(demoUser);
        setToken(demoToken);
        setIsAuthenticated(true);
        
        // Store in localStorage with employee prefix
        localStorage.setItem('employee-auth-token', demoToken);
        localStorage.setItem('employee-auth-user', JSON.stringify(demoUser));
        
        console.log('Employee demo login successful:', { user: demoUser, token: demoToken });
        return;
      }

      // Try real backend login
      let response: Response;
      
      try {
        // Employee login endpoint - will be connected to backend later
        console.log('Attempting employee login via proxy to:', 'employee/auth/login');
        console.log('With credentials:', { email: credentials.email });
        
        response = await fetch('/api/proxy/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            ...credentials,
            endpoint: 'employee/auth/login' // Different endpoint for employees
          }),
        });
        
        console.log('Employee login response received:', response.status, response.statusText);
      } catch (fetchError) {
        console.error('Fetch error details:', fetchError);
        throw new Error('لا يمكن الاتصال بالخادم. استخدم البيانات التجريبية: employee@demo.com / employee123');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. جرب: employee@demo.com / employee123');
        } else if (response.status === 404) {
          throw new Error('خادم تسجيل الدخول غير متاح. استخدم البيانات التجريبية: employee@demo.com / employee123');
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
        
        // Store in localStorage with employee prefix
        localStorage.setItem('employee-auth-token', authToken);
        localStorage.setItem('employee-auth-user', JSON.stringify(userData));
        
        console.log('Employee login successful:', { user: userData, token: authToken });
      } else {
        throw new Error('استجابة غير صحيحة من الخادم');
      }
    } catch (error) {
      console.error('Employee login error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('خطأ في الاتصال بالخادم. استخدم البيانات التجريبية: employee@demo.com / employee123');
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function for employees
  const logout = (): void => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage with employee prefix
    localStorage.removeItem('employee-auth-token');
    localStorage.removeItem('employee-auth-user');
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

