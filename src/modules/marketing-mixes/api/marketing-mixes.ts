import { apiClient } from '@/lib/api-client';
import {
  MarketingMix,
  MarketingMixesResponse,
  MarketingMixDetailsResponse,
  CreateMarketingMixRequest,
  UpdateMarketingMixRequest,
  MarketingMixFilters,
} from '../types';

export class MarketingMixesApi {
  private static baseUrl = '/api/v1/admin/marketing-mixes';

  // Get all marketing mixes
  static async getMarketingMixes(filters?: MarketingMixFilters): Promise<MarketingMixesResponse> {
    const params = new URLSearchParams();

    if (filters?.pda_document_id) params.append('pda_document_id', filters.pda_document_id.toString());
    if (filters?.element) params.append('element', filters.element);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return await apiClient.get<MarketingMixesResponse>(url);
  }

  // Get single marketing mix
  static async getMarketingMix(id: number): Promise<MarketingMixDetailsResponse> {
    return await apiClient.get<MarketingMixDetailsResponse>(`${this.baseUrl}/${id}`);
  }

  // Create marketing mix
  static async createMarketingMix(data: CreateMarketingMixRequest): Promise<{ success: boolean; data: MarketingMix; message: string }> {
    return await apiClient.post<{ success: boolean; data: MarketingMix; message: string }>(
      this.baseUrl,
      data as unknown as Record<string, unknown>
    );
  }

  // Update marketing mix
  static async updateMarketingMix(
    id: number,
    data: UpdateMarketingMixRequest
  ): Promise<{ success: boolean; data: MarketingMix; message: string }> {
    return await apiClient.put<{ success: boolean; data: MarketingMix; message: string }>(
      `${this.baseUrl}/${id}`,
      data as unknown as Record<string, unknown>
    );
  }

  // Delete marketing mix
  static async deleteMarketingMix(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}

