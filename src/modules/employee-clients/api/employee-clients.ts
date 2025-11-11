import { apiClient } from '@/lib/api-client';
import {
  EmployeeClientsResponse,
  EmployeeClientDetailsResponse,
  ClientLeadsResponse,
  ClientQuotationsResponse,
  ClientContractsResponse,
  EmployeeClientFilters,
  CitiesLookupResponse,
  StatusesLookupResponse,
} from '../types';

export class EmployeeClientsAPI {
  private static baseUrl = '/api/v1/employee/clients';

  // Get all clients for the logged-in employee
  static async getClients(filters?: EmployeeClientFilters): Promise<EmployeeClientsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.size) params.append('size', filters.size);
    if (filters?.city_id) params.append('city_id', filters.city_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<EmployeeClientsResponse>(url);
  }

  // Get single client details
  static async getClientById(clientId: number): Promise<EmployeeClientDetailsResponse> {
    return await apiClient.get<EmployeeClientDetailsResponse>(`${this.baseUrl}/${clientId}`);
  }

  // Get client leads
  static async getClientLeads(clientId: number, page?: number, perPage?: number): Promise<ClientLeadsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (perPage) params.append('per_page', perPage.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${clientId}/leads?${queryString}` : `${this.baseUrl}/${clientId}/leads`;
    
    return await apiClient.get<ClientLeadsResponse>(url);
  }

  // Get client quotations
  static async getClientQuotations(clientId: number, page?: number, perPage?: number): Promise<ClientQuotationsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (perPage) params.append('per_page', perPage.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${clientId}/quotations?${queryString}` : `${this.baseUrl}/${clientId}/quotations`;
    
    return await apiClient.get<ClientQuotationsResponse>(url);
  }

  // Get client contracts
  static async getClientContracts(clientId: number, page?: number, perPage?: number): Promise<ClientContractsResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (perPage) params.append('per_page', perPage.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${clientId}/contracts?${queryString}` : `${this.baseUrl}/${clientId}/contracts`;
    
    return await apiClient.get<ClientContractsResponse>(url);
  }

  // Lookup APIs
  static async getCities(): Promise<CitiesLookupResponse> {
    return await apiClient.get<CitiesLookupResponse>(`${this.baseUrl}/lookup/cities`);
  }

  static async getStatuses(): Promise<StatusesLookupResponse> {
    return await apiClient.get<StatusesLookupResponse>(`${this.baseUrl}/lookup/statuses`);
  }
}

