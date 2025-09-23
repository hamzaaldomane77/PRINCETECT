import { apiClient } from '@/lib/api-client';
import { 
  Lead, 
  LeadsResponse, 
  CreateLeadRequest, 
  UpdateLeadRequest,
  CreateLeadApiRequest,
  UpdateLeadApiRequest,
  LeadFilters 
} from '../types';

export class LeadsApi {
  private static baseUrl = '/api/v1/admin/leads';

  static async getLeads(filters?: LeadFilters): Promise<LeadsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.size) params.append('size', filters.size);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters?.city_id) params.append('city_id', filters.city_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<LeadsResponse>(url);
  }

  static async getLead(id: number): Promise<{ success: boolean; data: Lead }> {
    return await apiClient.get<{ success: boolean; data: Lead }>(`${this.baseUrl}/${id}`);
  }

  static async createLead(data: CreateLeadRequest | FormData): Promise<{ success: boolean; data: Lead }> {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return await apiClient.postFormData<{ success: boolean; data: Lead }>(this.baseUrl, data);
    }

    // Handle regular JSON data
    const apiData: CreateLeadApiRequest = {
      ...data,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined,
    };

    // Remove undefined values to avoid sending them to the API
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof typeof apiData] === undefined) {
        delete apiData[key as keyof typeof apiData];
      }
    });

    return await apiClient.post<{ success: boolean; data: Lead }>(this.baseUrl, apiData as unknown as Record<string, unknown>);
  }

  static async updateLead(id: number, data: UpdateLeadRequest): Promise<{ success: boolean; data: Lead }> {
    const apiData: UpdateLeadApiRequest = {
      ...data,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined,
    };

    // Remove undefined values to avoid sending them to the API
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof typeof apiData] === undefined) {
        delete apiData[key as keyof typeof apiData];
      }
    });

    return await apiClient.put<{ success: boolean; data: Lead }>(`${this.baseUrl}/${id}`, apiData as unknown as Record<string, unknown>);
  }

  static async deleteLead(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
