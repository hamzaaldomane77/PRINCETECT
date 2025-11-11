import { apiClient } from '@/lib/api-client';
import {
  EmployeeLeadsResponse,
  EmployeeLeadDetailsResponse,
  EmployeeLeadFilters,
  CreateEmployeeLeadRequest,
  UpdateEmployeeLeadRequest,
  LookupResponse,
  ConvertLeadToClientResponse,
} from '../types';

export class EmployeeLeadsAPI {
  private static baseUrl = '/api/v1/employee/leads';

  // Get all leads for the logged-in employee
  static async getLeads(filters?: EmployeeLeadFilters): Promise<EmployeeLeadsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.city_id) params.append('city_id', filters.city_id.toString());
    if (filters?.source) params.append('source', filters.source);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<EmployeeLeadsResponse>(url);
  }

  // Get single lead details
  static async getLeadById(leadId: number): Promise<EmployeeLeadDetailsResponse> {
    return await apiClient.get<EmployeeLeadDetailsResponse>(`${this.baseUrl}/${leadId}`);
  }

  // Create a new lead
  static async createLead(data: CreateEmployeeLeadRequest | FormData): Promise<EmployeeLeadDetailsResponse> {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return await apiClient.postFormData<EmployeeLeadDetailsResponse>(this.baseUrl, data);
    }

    // Handle regular JSON data or convert to FormData if logo exists
    if (data.logo && data.logo instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key as keyof CreateEmployeeLeadRequest];
        if (value !== null && value !== undefined) {
          if (key === 'logo' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return await apiClient.postFormData<EmployeeLeadDetailsResponse>(this.baseUrl, formData);
    }

    // Regular JSON request
    const jsonData: Record<string, unknown> = {};
    Object.keys(data).forEach(key => {
      const value = data[key as keyof CreateEmployeeLeadRequest];
      if (value !== null && value !== undefined && key !== 'logo') {
        jsonData[key] = value;
      }
    });

    return await apiClient.post<EmployeeLeadDetailsResponse>(this.baseUrl, jsonData);
  }

  // Update a lead
  static async updateLead(leadId: number, data: UpdateEmployeeLeadRequest | FormData): Promise<EmployeeLeadDetailsResponse> {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return await apiClient.putFormData<EmployeeLeadDetailsResponse>(`${this.baseUrl}/${leadId}`, data);
    }

    // Handle regular JSON data or convert to FormData if logo exists
    if (data.logo && data.logo instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key as keyof UpdateEmployeeLeadRequest];
        if (value !== null && value !== undefined) {
          if (key === 'logo' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      return await apiClient.putFormData<EmployeeLeadDetailsResponse>(`${this.baseUrl}/${leadId}`, formData);
    }

    // Regular JSON request
    const jsonData: Record<string, unknown> = {};
    Object.keys(data).forEach(key => {
      const value = data[key as keyof UpdateEmployeeLeadRequest];
      if (value !== null && value !== undefined && key !== 'logo') {
        jsonData[key] = value;
      }
    });

    return await apiClient.put<EmployeeLeadDetailsResponse>(`${this.baseUrl}/${leadId}`, jsonData);
  }

  // Delete a lead
  static async deleteLead(leadId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${leadId}`);
  }

  // Convert lead to client
  static async convertLeadToClient(leadId: number): Promise<ConvertLeadToClientResponse> {
    return await apiClient.post<ConvertLeadToClientResponse>(`${this.baseUrl}/${leadId}/convert`, {});
  }

  // Lookup APIs
  static async getCities(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/cities`);
  }

  static async getStatuses(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/statuses`);
  }

  static async getPriorities(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/priorities`);
  }

  static async getEmployees(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/employees`);
  }

  static async getClients(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/clients`);
  }
}

