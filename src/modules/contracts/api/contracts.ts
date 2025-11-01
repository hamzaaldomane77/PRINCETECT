import { apiClient } from '@/lib/api-client';
import { 
  Contract, 
  ContractsResponse, 
  CreateContractRequest, 
  UpdateContractRequest, 
  ContractFilters,
  LookupResponse,
  StatusOption,
  PaymentTermsOption
} from '../types';

export class ContractsApi {
  private static baseUrl = '/api/v1/admin/contracts';

  // Get all contracts
  static async getContracts(filters?: ContractFilters): Promise<ContractsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_terms) params.append('payment_terms', filters.payment_terms);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters?.client_id) params.append('client_id', filters.client_id.toString());
    if (filters?.lead_id) params.append('lead_id', filters.lead_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<ContractsResponse>(url);
  }

  // Get single contract
  static async getContract(id: number): Promise<{ success: boolean; data: Contract; message: string }> {
    return await apiClient.get<{ success: boolean; data: Contract; message: string }>(`${this.baseUrl}/${id}`);
  }

  // Create contract
  static async createContract(data: CreateContractRequest): Promise<{ success: boolean; data: Contract }> {
    return await apiClient.post<{ success: boolean; data: Contract }>(this.baseUrl, data as unknown as Record<string, unknown>);
  }

  // Update contract
  static async updateContract(id: number, data: UpdateContractRequest): Promise<{ success: boolean; data: Contract }> {
    return await apiClient.put<{ success: boolean; data: Contract }>(`${this.baseUrl}/${id}`, data as unknown as Record<string, unknown>);
  }

  // Delete contract
  static async deleteContract(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  // Lookup APIs
  static async getLeadsLookup(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/leads`);
  }

  static async getClientsLookup(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/clients`);
  }

  static async getQuotationsLookup(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/quotations`);
  }

  static async getEmployeesLookup(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/employees`);
  }

  static async getStatusesLookup(): Promise<{ success: boolean; data: StatusOption[] }> {
    return await apiClient.get<{ success: boolean; data: StatusOption[] }>(`${this.baseUrl}/lookup/statuses`);
  }

  static async getPaymentTermsLookup(): Promise<{ success: boolean; data: PaymentTermsOption[] }> {
    return await apiClient.get<{ success: boolean; data: PaymentTermsOption[] }>(`${this.baseUrl}/lookup/payment-terms`);
  }

  // Contract Services Management
  static async addContractService(contractId: number, data: {
    service_id: number;
    quantity: number;
    unit_price: number;
    delivery_date: string;
    description?: string;
    notes?: string;
  }): Promise<{ success: boolean; data: any; message: string }> {
    return await apiClient.post<{ success: boolean; data: any; message: string }>(`${this.baseUrl}/${contractId}/services`, data);
  }

  static async updateContractService(contractId: number, serviceId: number, data: {
    service_id?: number;
    quantity?: number;
    unit_price?: number;
    delivery_date?: string;
    description?: string;
    notes?: string;
  }): Promise<{ success: boolean; data: any; message: string }> {
    return await apiClient.put<{ success: boolean; data: any; message: string }>(`${this.baseUrl}/${contractId}/services/${serviceId}`, data);
  }

  static async deleteContractService(contractId: number, serviceId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${contractId}/services/${serviceId}`);
  }
}
