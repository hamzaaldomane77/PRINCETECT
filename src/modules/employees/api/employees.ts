import { apiClient } from '@/lib/api-client';
import {
  Employee,
  EmployeesResponse,
  EmployeeDetailsResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdateEmployeeApiRequest,
  EmployeeFilters,
} from '../types';

const API_BASE = '/api/v1/admin/employees';

export class EmployeesAPI {
  // Get all employees with filters
  static async getEmployees(filters?: EmployeeFilters): Promise<EmployeesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters?.q) queryParams.append('q', filters.q);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.department_id) queryParams.append('department_id', filters.department_id.toString());
    if (filters?.job_title_id) queryParams.append('job_title_id', filters.job_title_id.toString());
    if (filters?.employee_type_id) queryParams.append('employee_type_id', filters.employee_type_id.toString());
    if (filters?.gender) queryParams.append('gender', filters.gender);
    if (filters?.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters?.page) queryParams.append('page', filters.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<EmployeesResponse>(endpoint);
  }

  // Get employee by ID
  static async getEmployeeById(id: number): Promise<Employee> {
    try {
      const result = await apiClient.get<EmployeeDetailsResponse>(`${API_BASE}/${id}`);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      if (!result.success) {
        throw new Error((result as any).message || 'API request failed');
      }
      
      if (!result.data) {
        throw new Error('Employee not found in response data');
      }
      
      return result.data;
    } catch (error: any) {
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Handle HTTP errors
      if (error?.message?.includes('404')) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (error?.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to view this employee.');
      }
      
      if (error?.message?.includes('500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      // Re-throw the original error if it already has a message
      throw error;
    }
  }

  // Create new employee
  static async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    let requestData: FormData | CreateEmployeeRequest;
    
    // If there's a photo, use FormData for multipart upload
    if (data.photo) {
      requestData = new FormData();
      
      // Append all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof File) {
          (requestData as FormData).append(key, value);
        } else if (value !== null && value !== undefined && value !== '') {
          (requestData as FormData).append(key, String(value));
        }
      });
    } else {
      // If no photo, use regular JSON
      requestData = {
        ...data,
        photo: undefined, // Remove photo field for JSON request
      } as CreateEmployeeRequest;
    }
    
    const result = await apiClient.post<{ success: boolean; data: { employee: Employee } }>(
      API_BASE, 
      requestData as FormData | Record<string, unknown>
    );
    
    if (!result.success) {
      throw new Error('Failed to create employee');
    }
    
    return result.data.employee;
  }

  // Update employee
  static async updateEmployee(id: number, data: UpdateEmployeeApiRequest): Promise<Employee> {
    const result = await apiClient.put<{ success: boolean; data: { employee: Employee } }>(`${API_BASE}/${id}`, data as Record<string, unknown>);
    
    if (!result.success) {
      throw new Error('Failed to update employee');
    }
    
    return result.data.employee;
  }

  // Delete employee
  static async deleteEmployee(id: number): Promise<void> {
    try {
      const result = await apiClient.delete<{ success: boolean; message?: string }>(`${API_BASE}/${id}`);
      
      if (!result.success) {
        // Check for specific error messages
        const errorMessage = result.message || 'Failed to delete employee';
        
        // Check for exact message match and partial match
        if (errorMessage === 'Cannot delete employee with existing records' || 
            errorMessage.includes('existing records') ||
            errorMessage.includes('Cannot delete')) {
          throw new Error('EMPLOYEE_HAS_RECORDS');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle specific error cases
      if ((error as Error)?.message === 'EMPLOYEE_HAS_RECORDS') {
        throw error; // Re-throw as is for specific handling
      }
      
      // Handle other HTTP errors
      if ((error as Error)?.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to delete this employee.');
      }
      
      if ((error as Error)?.message?.includes('404')) {
        throw new Error(`Employee with ID ${id} not found.`);
      }
      
      throw error;
    }
  }

  // Toggle employee status
  static async toggleEmployeeStatus(id: number): Promise<Employee> {
    const result = await apiClient.patch<{ success: boolean; data: { employee: Employee } }>(`${API_BASE}/${id}/toggle-status`);
    
    if (!result.success) {
      throw new Error('Failed to toggle employee status');
    }
    
    return result.data.employee;
  }
}
