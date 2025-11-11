import { apiClient } from '@/lib/api-client';
import {
  EmployeeQuotationsResponse,
  EmployeeQuotationDetailsResponse,
  QuotationServicesResponse,
  EmployeeQuotationFilters,
  ClientsLookupResponse,
  LeadsLookupResponse,
  StatusesLookupResponse,
  CurrenciesLookupResponse,
} from '../types';

export class EmployeeQuotationsAPI {
  private static baseUrl = '/api/v1/employee/quotations';

  // Get all quotations for the logged-in employee
  static async getQuotations(filters?: EmployeeQuotationFilters): Promise<EmployeeQuotationsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.lead_id) params.append('lead_id', filters.lead_id.toString());
    if (filters?.client_id) params.append('client_id', filters.client_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<EmployeeQuotationsResponse>(url);
  }

  // Get single quotation details
  static async getQuotationById(quotationId: number): Promise<EmployeeQuotationDetailsResponse> {
    return await apiClient.get<EmployeeQuotationDetailsResponse>(`${this.baseUrl}/${quotationId}`);
  }

  // Get quotation services
  static async getQuotationServices(quotationId: number, page?: number, perPage?: number): Promise<QuotationServicesResponse> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (perPage) params.append('per_page', perPage.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${quotationId}/services?${queryString}` : `${this.baseUrl}/${quotationId}/services`;
    
    return await apiClient.get<QuotationServicesResponse>(url);
  }

  // Lookup APIs
  static async getClients(): Promise<ClientsLookupResponse> {
    return await apiClient.get<ClientsLookupResponse>(`${this.baseUrl}/lookup/clients`);
  }

  static async getLeads(): Promise<LeadsLookupResponse> {
    return await apiClient.get<LeadsLookupResponse>(`${this.baseUrl}/lookup/leads`);
  }

  static async getStatuses(): Promise<StatusesLookupResponse> {
    return await apiClient.get<StatusesLookupResponse>(`${this.baseUrl}/lookup/statuses`);
  }

  static async getCurrencies(): Promise<CurrenciesLookupResponse> {
    return await apiClient.get<CurrenciesLookupResponse>(`${this.baseUrl}/lookup/currencies`);
  }
}

