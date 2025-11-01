import { apiClient } from '@/lib/api-client';
import {
  PdaDocument,
  PdaDocumentsResponse,
  PdaDocumentDetailsResponse,
  CreatePdaDocumentRequest,
  UpdatePdaDocumentRequest,
  PdaDocumentFilters,
  LookupResponse,
} from '../types';

export class PdaDocumentsApi {
  private static baseUrl = '/api/v1/admin/pda-documents';

  // Get all PDA documents
  static async getPdaDocuments(filters?: PdaDocumentFilters): Promise<PdaDocumentsResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.contract_id) params.append('contract_id', filters.contract_id.toString());
    if (filters?.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return await apiClient.get<PdaDocumentsResponse>(url);
  }

  // Get single PDA document
  static async getPdaDocument(id: number): Promise<PdaDocumentDetailsResponse> {
    return await apiClient.get<PdaDocumentDetailsResponse>(`${this.baseUrl}/${id}`);
  }

  // Create PDA document
  static async createPdaDocument(data: CreatePdaDocumentRequest): Promise<{ success: boolean; data: PdaDocument; message: string }> {
    return await apiClient.post<{ success: boolean; data: PdaDocument; message: string }>(
      this.baseUrl,
      data as unknown as Record<string, unknown>
    );
  }

  // Update PDA document
  static async updatePdaDocument(
    id: number,
    data: UpdatePdaDocumentRequest
  ): Promise<{ success: boolean; data: PdaDocument; message: string }> {
    return await apiClient.put<{ success: boolean; data: PdaDocument; message: string }>(
      `${this.baseUrl}/${id}`,
      data as unknown as Record<string, unknown>
    );
  }

  // Delete PDA document
  static async deletePdaDocument(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  // Lookup APIs for dropdowns
  static async getContractsLookup(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/contracts`);
  }

  static async getCustomersLookup(): Promise<LookupResponse> {
    return await apiClient.get<LookupResponse>(`${this.baseUrl}/lookup/customers`);
  }
}

