import { apiClient } from '@/lib/api-client';
import {
  Service,
  ServicesResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceFilters,
} from '../types';

const API_BASE = '/api/v1/admin/services';

export class ServicesAPI {
  // Get all services with filters
  static async getServices(filters: ServiceFilters = {}): Promise<ServicesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    if (filters.category_id) queryParams.append('category_id', filters.category_id.toString());
    if (filters.department_id) queryParams.append('department_id', filters.department_id.toString());
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<ServicesResponse>(endpoint);
  }

  // Get service by ID
  static async getServiceById(id: number): Promise<Service> {
    const result = await apiClient.get<{ success: boolean; data: { service: Service } }>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to fetch service');
    }
    
    return result.data.service;
  }

  // Create new service
  static async createService(data: CreateServiceRequest): Promise<Service> {
    const result = await apiClient.post<{ success: boolean; data: { service: Service } }>(API_BASE, data);
    
    if (!result.success) {
      throw new Error('Failed to create service');
    }
    
    return result.data.service;
  }

  // Update service
  static async updateService(id: number, data: UpdateServiceRequest): Promise<Service> {
    const result = await apiClient.put<{ success: boolean; data: { service: Service } }>(`${API_BASE}/${id}`, data);
    
    if (!result.success) {
      throw new Error('Failed to update service');
    }
    
    return result.data.service;
  }

  // Delete service
  static async deleteService(id: number): Promise<void> {
    const result = await apiClient.post<{ success: boolean }>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to delete service');
    }
  }

  // Toggle service status
  static async toggleServiceStatus(id: number): Promise<Service> {
    const result = await apiClient.patch<{ success: boolean; data: { service: Service } }>(`${API_BASE}/${id}/toggle-status`);
    
    if (!result.success) {
      throw new Error('Failed to toggle service status');
    }
    
    return result.data.service;
  }
}
