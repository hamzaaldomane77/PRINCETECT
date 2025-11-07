import { BASE_URL } from '@/config/api';
import { EmployeeLoginCredentials, EmployeeLoginResponse } from '../types';

const API_BASE = `${BASE_URL}/api/v1/employee`;

export class EmployeeAuthAPI {
  /**
   * Employee login
   */
  static async login(credentials: EmployeeLoginCredentials): Promise<EmployeeLoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (response.status === 404) {
          throw new Error('خدمة تسجيل الدخول غير متاحة حالياً');
        } else if (response.status === 500) {
          throw new Error('خطأ في الخادم، يرجى المحاولة لاحقاً');
        } else if (response.status === 422) {
          const errorData = await response.json();
          const errors = errorData.errors || {};
          const errorMessages = Object.values(errors).flat();
          throw new Error(errorMessages.join(', ') || 'بيانات غير صحيحة');
        } else {
          throw new Error(`فشل في تسجيل الدخول (${response.status})`);
        }
      }

      const data: EmployeeLoginResponse = await response.json();

      if (!data.success || !data.data.user) {
        throw new Error(data.message || 'استجابة غير صحيحة من الخادم');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('خطأ في الاتصال بالخادم');
    }
  }

  /**
   * Employee logout - calls backend logout endpoint
   */
  static async logout(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('Logout API call failed, continuing with local logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend call fails
    }
  }

  /**
   * Verify employee token (optional - can be used to check if token is still valid)
   */
  static async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Refresh employee token
   * Endpoint: {{base_url}}/api/v1/employee/auth/refresh
   */
  static async refreshToken(token: string): Promise<{ token: string; token_type: string } | null> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn('Token refresh failed:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          token: data.data.token,
          token_type: data.data.token_type || 'Bearer'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  /**
   * Get current employee profile
   */
  static async getProfile(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }
}

