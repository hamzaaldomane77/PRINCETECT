import { apiClient } from '@/lib/api-client';
import {
  EmployeeType,
  EmployeeTypesResponse,
  EmployeeTypeDetailsResponse,
  CreateEmployeeTypeRequest,
  UpdateEmployeeTypeRequest,
  EmployeeTypeFilters,
} from '../types';

const API_BASE = '/api/v1/admin/employee-types';

export class EmployeeTypesAPI {
  // Get all employee types with filters
  static async getEmployeeTypes(filters: EmployeeTypeFilters = {}): Promise<EmployeeTypesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<EmployeeTypesResponse>(endpoint);
  }

  // Get employee type by ID
  static async getEmployeeTypeById(id: number): Promise<EmployeeType> {
    try {
      const result = await apiClient.get<EmployeeTypeDetailsResponse>(`${API_BASE}/${id}`);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      if (!result.success) {
        throw new Error((result as any).message || 'API request failed');
      }
      
      if (!result.data) {
        throw new Error('Employee type not found in response data');
      }
      
      return result.data;
    } catch (error) {
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Handle HTTP errors
      if ((error as any)?.message?.includes('404')) {
        throw new Error(`Employee type with ID ${id} not found`);
      }
      
      if ((error as any)?.message?.includes('401') || (error as any)?.message?.includes('Authentication')) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if ((error as any)?.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to view this employee type.');
      }
      
      if ((error as any)?.message?.includes('500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      // Re-throw the original error if it already has a message
      throw error;
    }
  }

  // Create new employee type
  static async createEmployeeType(data: CreateEmployeeTypeRequest): Promise<EmployeeType> {
    const result = await apiClient.post<{ success: boolean; data: { employee_type: EmployeeType } }>(API_BASE, data as unknown as Record<string, unknown>);
    
    if (!result.success) {
      throw new Error('Failed to create employee type');
    }
    
    return result.data.employee_type;
  }

  // Update employee type
  static async updateEmployeeType(id: number, data: UpdateEmployeeTypeRequest): Promise<EmployeeType> {
    const result = await apiClient.put<{ success: boolean; data: { employee_type: EmployeeType } }>(`${API_BASE}/${id}`, data as unknown as Record<string, unknown>);
    
    if (!result.success) {
      throw new Error('Failed to update employee type');
    }
    
    return result.data.employee_type;
  }

  // Delete employee type
  static async deleteEmployeeType(id: number): Promise<void> {
    try {
      const result = await apiClient.delete<{ success: boolean; message?: string }>(`${API_BASE}/${id}`);
      
      if (!result.success) {
        // Check for specific error messages
        const errorMessage = result.message || 'Failed to delete employee type';
        
        // Check for exact message match and partial match
        if (errorMessage === 'Cannot delete employee type that is assigned to employees' || 
            errorMessage.includes('assigned to employees')) {
          throw new Error('ASSIGNED_TO_EMPLOYEES');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle specific error cases
      if ((error as Error)?.message === 'ASSIGNED_TO_EMPLOYEES') {
        throw error; // Re-throw as is for specific handling
      }
      
      // Handle other HTTP errors
      if ((error as Error)?.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to delete this employee type.');
      }
      
      if ((error as Error)?.message?.includes('404')) {
        throw new Error(`Employee type with ID ${id} not found.`);
      }
      
      throw error;
    }
  }

  // Toggle employee type status
  static async toggleEmployeeTypeStatus(id: number): Promise<EmployeeType> {
    const result = await apiClient.patch<{ success: boolean; data: { employee_type: EmployeeType } }>(`${API_BASE}/${id}/toggle-status`);
    
    if (!result.success) {
      throw new Error('Failed to toggle employee type status');
    }
    
    return result.data.employee_type;
  }
}
