import { apiClient } from '@/lib/api-client';
import { 
  CompetitorsResponse, 
  CompetitorDetailsResponse, 
  CreateCompetitorRequest, 
  UpdateCompetitorRequest 
} from '../types/competitors';

export class CompetitorsApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/competitors`;
  }

  static async getCompetitors(pdaDocumentId: number): Promise<CompetitorsResponse> {
    return await apiClient.get<CompetitorsResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async getCompetitor(pdaDocumentId: number, competitorId: number): Promise<CompetitorDetailsResponse> {
    return await apiClient.get<CompetitorDetailsResponse>(`${this.getBaseUrl(pdaDocumentId)}/${competitorId}`);
  }

  static async createCompetitor(pdaDocumentId: number, data: CreateCompetitorRequest): Promise<CompetitorDetailsResponse> {
    return await apiClient.post<CompetitorDetailsResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateCompetitor(
    pdaDocumentId: number, 
    competitorId: number, 
    data: UpdateCompetitorRequest
  ): Promise<CompetitorDetailsResponse> {
    return await apiClient.put<CompetitorDetailsResponse>(
      `${this.getBaseUrl(pdaDocumentId)}/${competitorId}`, 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteCompetitor(pdaDocumentId: number, competitorId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${competitorId}`
    );
  }
}

