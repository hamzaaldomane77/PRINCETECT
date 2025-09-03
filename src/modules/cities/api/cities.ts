import { apiClient } from '@/lib/api-client';

const API_BASE = '/api/v1/admin/cities';

export interface City {
  id: number;
  name: string;
  code: string;
  country: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CitiesResponse {
  success: boolean;
  data: {
    cities: City[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateCityData {
  name: string;
  code: string;
  country: string;
  is_active: boolean;
  notes?: string;
}

export interface UpdateCityData {
  name?: string;
  code?: string;
  country?: string;
  is_active?: boolean;
  notes?: string;
}

export class CitiesAPI {
  // Get cities with pagination and search
  static async getCities(params?: {
    search?: string;
    country?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<CitiesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.country) queryParams.append('country', params.country);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_BASE}?${queryString}` : API_BASE;
    
    return await apiClient.get<CitiesResponse>(endpoint);
  }

  // Get single city
  static async getCity(id: number): Promise<City> {
    const result = await apiClient.get<any>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to fetch city');
    }
    
    return result.data.city;
  }

  // Create city
  static async createCity(data: CreateCityData): Promise<{ success: boolean; data: City }> {
    return await apiClient.post<{ success: boolean; data: City }>(API_BASE, data);
  }

  // Update city
  static async updateCity(id: number, data: UpdateCityData): Promise<{ success: boolean; data: City }> {
    return await apiClient.put<{ success: boolean; data: City }>(`${API_BASE}/${id}`, data);
  }

  // Delete city
  static async deleteCity(id: number): Promise<void> {
    const result = await apiClient.delete<any>(`${API_BASE}/${id}`);
    
    if (!result.success) {
      throw new Error('Failed to delete city');
    }
  }

  // Toggle city status
  static async toggleCityStatus(id: number): Promise<{ success: boolean; data: City }> {
    return await apiClient.patch<{ success: boolean; data: City }>(`${API_BASE}/${id}/toggle-status`);
  }
}
