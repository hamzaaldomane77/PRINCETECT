import { apiClient } from '@/lib/api-client';

const API_BASE = '/api/v1/admin/departments';

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  manager_id: number | null;
  manager: any | null;
}

export interface DepartmentsResponse {
  success: boolean;
  data: {
    departments: Department[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  manager_id?: number | null;
  is_active: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  manager_id?: number | null;
  is_active?: boolean;
}

export class DepartmentsAPI {
  // Get departments with pagination and search
  static async getDepartments(params?: {
    search?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<DepartmentsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}?${queryString}` : API_BASE;
    
    return await apiClient.get<DepartmentsResponse>(endpoint);
  }

  // Get single department
  static async getDepartment(id: number): Promise<Department> {
    const result = await apiClient.get<any>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to fetch department');
    }
    
    return result.data.department;
  }

  // Create department
  static async createDepartment(data: CreateDepartmentData): Promise<{ success: boolean; data: Department }> {
    return await apiClient.post<{ success: boolean; data: Department }>(API_BASE, data);
  }

  // Update department
  static async updateDepartment(id: number, data: UpdateDepartmentData): Promise<{ success: boolean; data: Department }> {
    return await apiClient.put<{ success: boolean; data: Department }>(`${API_BASE}/${id}`, data);
  }

  // Delete department
  static async deleteDepartment(id: number): Promise<void> {
    const result = await apiClient.delete<any>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to delete department');
    }
  }

  // Toggle department status
  static async toggleDepartmentStatus(id: number): Promise<{ success: boolean; data: Department }> {
    return await apiClient.patch<{ success: boolean; data: Department }>(`${API_BASE}/${id}/toggle-status`);
  }
}
