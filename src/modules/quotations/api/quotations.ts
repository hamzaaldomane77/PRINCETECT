import { apiClient } from '@/lib/api-client';
import type {
  Quotation,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationFilters,
  QuotationsResponse,
  QuotationResponse
} from '../types';

export class QuotationsApi {
  private static baseUrl = '/api/v1/admin/quotations';

  static async getQuotations(filters?: QuotationFilters): Promise<QuotationsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.client_id) params.append('client_id', filters.client_id.toString());
    if (filters?.lead_id) params.append('lead_id', filters.lead_id.toString());
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<QuotationsResponse>(url);
  }

  static async getQuotation(id: number): Promise<QuotationResponse> {
    return await apiClient.get<QuotationResponse>(`${this.baseUrl}/${id}`);
  }

  static async createQuotation(data: CreateQuotationRequest): Promise<QuotationResponse> {
    const apiData = {
      lead_id: data.lead_id || null,
      client_id: data.client_id || null,
      quotation_number: data.quotation_number,
      title: data.title,
      description: data.description || '',
      subtotal: data.subtotal || 0,
      tax_rate: data.tax_rate || 0,
      tax_amount: data.tax_amount || 0,
      discount_rate: data.discount_rate || 0,
      discount_amount: data.discount_amount || 0,
      total_amount: data.total_amount || 0,
      currency: data.currency || 'SAR',
      valid_until: data.valid_until || '',
      status: data.status || 'draft',
      notes: data.notes || '',
      terms_conditions: data.terms_conditions || '',
      assigned_to: data.assigned_to || null,
      quotation_services: data.quotation_services || []
    };

    return await apiClient.post<QuotationResponse>(this.baseUrl, apiData as unknown as Record<string, unknown>);
  }

  static async updateQuotation(data: UpdateQuotationRequest): Promise<QuotationResponse> {
    const { id, ...updateData } = data;
    const apiData = {
      lead_id: updateData.lead_id || null,
      client_id: updateData.client_id || null,
      quotation_number: updateData.quotation_number || '',
      title: updateData.title || '',
      description: updateData.description || '',
      subtotal: updateData.subtotal || 0,
      tax_rate: updateData.tax_rate || 0,
      tax_amount: updateData.tax_amount || 0,
      discount_rate: updateData.discount_rate || 0,
      discount_amount: updateData.discount_amount || 0,
      total_amount: updateData.total_amount || 0,
      currency: updateData.currency || 'SAR',
      valid_until: updateData.valid_until || '',
      status: updateData.status || 'draft',
      notes: updateData.notes || '',
      terms_conditions: updateData.terms_conditions || '',
      assigned_to: updateData.assigned_to || null,
      quotation_services: updateData.quotation_services || []
    };

    return await apiClient.put<QuotationResponse>(`${this.baseUrl}/${id}`, apiData as unknown as Record<string, unknown>);
  }

  static async deleteQuotation(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  // Lookup endpoints
  static async getLeadsLookup(): Promise<{ success: boolean; data: Array<{ id: number; name: string; company_name: string; email: string }> }> {
    return await apiClient.get<{ success: boolean; data: Array<{ id: number; name: string; company_name: string; email: string }> }>(`${this.baseUrl}/lookup/leads`);
  }

  static async getClientsLookup(): Promise<{ success: boolean; data: Array<{ id: number; name: string; company_name: string; email: string }> }> {
    return await apiClient.get<{ success: boolean; data: Array<{ id: number; name: string; company_name: string; email: string }> }>(`${this.baseUrl}/lookup/clients`);
  }

  static async getEmployeesLookup(): Promise<{ success: boolean; data: Array<{ id: number; first_name: string; last_name: string; employee_id: string; email: string | null; name: string }> }> {
    return await apiClient.get<{ success: boolean; data: Array<{ id: number; first_name: string; last_name: string; employee_id: string; email: string | null; name: string }> }>(`${this.baseUrl}/lookup/employees`);
  }

  static async getCurrenciesLookup(): Promise<{ success: boolean; data: Array<{ value: string; label: string }> }> {
    return await apiClient.get<{ success: boolean; data: Array<{ value: string; label: string }> }>(`${this.baseUrl}/lookup/currencies`);
  }

  static async getStatusesLookup(): Promise<{ success: boolean; data: Array<{ value: string; label: string }> }> {
    return await apiClient.get<{ success: boolean; data: Array<{ value: string; label: string }> }>(`${this.baseUrl}/lookup/statuses`);
  }

  static async getServicesLookup(): Promise<{ success: boolean; data: Array<{ id: number; name: string; base_price: string; currency: string }> }> {
    return await apiClient.get<{ success: boolean; data: Array<{ id: number; name: string; base_price: string; currency: string }> }>(`${this.baseUrl}/lookup/services`);
  }

  // Quotation Services
  static async getQuotationServices(quotationId: number): Promise<{ success: boolean; data: Array<any> }> {
    return await apiClient.get<{ success: boolean; data: Array<any> }>(`${this.baseUrl}/${quotationId}/services`);
  }

  static async addQuotationService(quotationId: number, data: { service_id: number; quantity: number; unit_price: number; description?: string; notes?: string }): Promise<{ success: boolean; data: any; message: string }> {
    return await apiClient.post<{ success: boolean; data: any; message: string }>(`${this.baseUrl}/${quotationId}/services`, data);
  }

  // Quotation Actions
  static async sendQuotation(quotationId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${quotationId}/send`);
  }

  static async acceptQuotation(quotationId: number, data: { notes?: string }): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${quotationId}/accept`, data);
  }

  static async rejectQuotation(quotationId: number, data: { rejection_reason: string }): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${quotationId}/reject`, data);
  }

  static async modifyQuotation(quotationId: number, data: { notes?: string }): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${quotationId}/modify`, data);
  }

  // Quotation Service Management
  static async updateQuotationService(quotationId: number, serviceId: number, data: { quantity: number; unit_price: number; description?: string; notes?: string }): Promise<{ success: boolean; data: any; message: string }> {
    return await apiClient.put<{ success: boolean; data: any; message: string }>(`${this.baseUrl}/${quotationId}/services/${serviceId}`, data);
  }

  static async deleteQuotationService(quotationId: number, serviceId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${quotationId}/services/${serviceId}`);
  }
}
