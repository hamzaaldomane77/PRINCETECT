import { apiClient } from '@/lib/api-client';
import {
  ServiceCategory,
  ServiceCategoriesResponse,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
  ServiceCategoryFilters,
} from '../types';

const API_BASE = '/api/v1/admin/service-categories';

export class ServiceCategoriesAPI {
  // Get all service categories with filters
  static async getServiceCategories(filters: ServiceCategoryFilters = {}): Promise<ServiceCategoriesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<ServiceCategoriesResponse>(endpoint);
  }

  // Get service category by ID
  static async getServiceCategoryById(id: number): Promise<ServiceCategory> {
    const result = await apiClient.get<{ success: boolean; data: { category: ServiceCategory } }>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to fetch service category');
    }
    
    return result.data.category;
  }

  // Create new service category
  static async createServiceCategory(data: CreateServiceCategoryRequest): Promise<ServiceCategory> {
    const result = await apiClient.post<{ success: boolean; data: { category: ServiceCategory } }>(API_BASE, data);
    
    if (!result.success) {
      throw new Error('Failed to create service category');
    }
    
    return result.data.category;
  }

  // Update service category
  static async updateServiceCategory(id: number, data: UpdateServiceCategoryRequest): Promise<ServiceCategory> {
    const result = await apiClient.put<{ success: boolean; data: { category: ServiceCategory } }>(`${API_BASE}/${id}`, data);
    
    if (!result.success) {
      throw new Error('Failed to update service category');
    }
    
    return result.data.category;
  }

  // Delete service category
  static async deleteServiceCategory(id: number): Promise<void> {
    const result = await apiClient.delete<{ success: boolean }>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to delete service category');
    }
  }

  // Toggle service category status
  static async toggleServiceCategoryStatus(id: number): Promise<ServiceCategory> {
    const result = await apiClient.patch<{ success: boolean; data: { category: ServiceCategory } }>(`${API_BASE}/${id}/toggle-status`);
    
    if (!result.success) {
      throw new Error('Failed to toggle service category status');
    }
    
    return result.data.category;
  }
}
