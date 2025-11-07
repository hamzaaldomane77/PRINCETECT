import { useMutation } from '@tanstack/react-query';
import { EmployeeAuthAPI } from '../api/employee-auth';
import { EmployeeLoginCredentials } from '../types';
import { toast } from 'sonner';

/**
 * Hook for employee login mutation
 */
export function useEmployeeLogin() {
  return useMutation({
    mutationFn: (credentials: EmployeeLoginCredentials) => 
      EmployeeAuthAPI.login(credentials),
    onError: (error: Error) => {
      console.error('Employee login error:', error);
      toast.error(error.message || 'فشل في تسجيل الدخول');
    },
  });
}

/**
 * Hook for employee logout mutation
 */
export function useEmployeeLogout() {
  return useMutation({
    mutationFn: (token: string) => EmployeeAuthAPI.logout(token),
    onError: (error: Error) => {
      console.error('Employee logout error:', error);
      // Don't show error toast for logout failures
    },
  });
}

/**
 * Hook for token verification
 */
export function useVerifyEmployeeToken() {
  return useMutation({
    mutationFn: (token: string) => EmployeeAuthAPI.verifyToken(token),
  });
}

/**
 * Hook for token refresh
 */
export function useRefreshEmployeeToken() {
  return useMutation({
    mutationFn: (token: string) => EmployeeAuthAPI.refreshToken(token),
  });
}

/**
 * Hook for fetching employee profile
 */
export function useEmployeeProfile(token: string) {
  return useMutation({
    mutationFn: () => EmployeeAuthAPI.getProfile(token),
    onError: (error: Error) => {
      console.error('Profile fetch error:', error);
      toast.error('فشل في تحميل بيانات الملف الشخصي');
    },
  });
}

