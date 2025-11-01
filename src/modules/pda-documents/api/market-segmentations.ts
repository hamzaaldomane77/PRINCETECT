import { apiClient } from '@/lib/api-client';
import { 
  MarketSegmentationsResponse, 
  MarketSegmentationDetailsResponse, 
  CreateMarketSegmentationRequest, 
  UpdateMarketSegmentationRequest 
} from '../types/market-segmentations';

export class MarketSegmentationsApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/market-segmentations`;
  }

  static async getMarketSegmentations(pdaDocumentId: number): Promise<MarketSegmentationsResponse> {
    return await apiClient.get<MarketSegmentationsResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async getMarketSegmentation(pdaDocumentId: number, segmentationId: number): Promise<MarketSegmentationDetailsResponse> {
    return await apiClient.get<MarketSegmentationDetailsResponse>(`${this.getBaseUrl(pdaDocumentId)}/${segmentationId}`);
  }

  static async createMarketSegmentation(pdaDocumentId: number, data: CreateMarketSegmentationRequest): Promise<MarketSegmentationDetailsResponse> {
    return await apiClient.post<MarketSegmentationDetailsResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateMarketSegmentation(
    pdaDocumentId: number, 
    segmentationId: number, 
    data: UpdateMarketSegmentationRequest
  ): Promise<MarketSegmentationDetailsResponse> {
    return await apiClient.put<MarketSegmentationDetailsResponse>(
      `${this.getBaseUrl(pdaDocumentId)}/${segmentationId}`, 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteMarketSegmentation(pdaDocumentId: number, segmentationId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${segmentationId}`
    );
  }
}

