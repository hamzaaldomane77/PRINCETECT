import { apiClient } from '@/lib/api-client';
import {
  EmployeeContractsResponse,
  EmployeeContractDetailsResponse,
  ContractServicesResponse,
  ContractTasksResponse,
  EmployeeContractFilters,
  ContractServicesFilters,
  ContractTasksFilters,
} from '../types';

export class EmployeeContractsAPI {
  private static baseUrl = '/api/v1/employee/contracts';

  // Get all contracts for the logged-in employee
  static async getContracts(filters?: EmployeeContractFilters): Promise<EmployeeContractsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.contract_type) params.append('contract_type', filters.contract_type);
    if (filters?.payment_terms) params.append('payment_terms', filters.payment_terms);
    if (filters?.currency) params.append('currency', filters.currency);
    if (filters?.client_id) params.append('client_id', filters.client_id.toString());
    if (filters?.lead_id) params.append('lead_id', filters.lead_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<EmployeeContractsResponse>(url);
  }

  // Get single contract details
  static async getContractById(contractId: number): Promise<EmployeeContractDetailsResponse> {
    return await apiClient.get<EmployeeContractDetailsResponse>(`${this.baseUrl}/${contractId}`);
  }

  // Get contract services
  static async getContractServices(contractId: number, filters?: ContractServicesFilters): Promise<ContractServicesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${contractId}/services?${queryString}` : `${this.baseUrl}/${contractId}/services`;
    
    return await apiClient.get<ContractServicesResponse>(url);
  }

  // Get contract tasks
  static async getContractTasks(contractId: number, filters?: ContractTasksFilters): Promise<ContractTasksResponse> {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append('q', filters.q);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigned_employee_id) params.append('assigned_employee_id', filters.assigned_employee_id.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/${contractId}/tasks?${queryString}` : `${this.baseUrl}/${contractId}/tasks`;
    
    return await apiClient.get<ContractTasksResponse>(url);
  }
}

