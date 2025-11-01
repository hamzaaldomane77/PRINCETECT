import { apiClient } from '@/lib/api-client';
import { SwotAnalysisResponse, SaveSwotAnalysisRequest } from '../types/swot';

export class SwotApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/swot`;
  }

  static async getSwotAnalysis(pdaDocumentId: number): Promise<SwotAnalysisResponse> {
    return await apiClient.get<SwotAnalysisResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async saveSwotAnalysis(
    pdaDocumentId: number, 
    data: SaveSwotAnalysisRequest
  ): Promise<SwotAnalysisResponse> {
    return await apiClient.post<SwotAnalysisResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }
}

