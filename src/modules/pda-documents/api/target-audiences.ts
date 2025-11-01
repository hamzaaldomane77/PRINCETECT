import { apiClient } from '@/lib/api-client';
import { 
  TargetAudiencesResponse, 
  TargetAudienceDetailsResponse, 
  CreateTargetAudienceRequest, 
  UpdateTargetAudienceRequest 
} from '../types/target-audiences';

export class TargetAudiencesApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/target-audiences`;
  }

  static async getTargetAudiences(pdaDocumentId: number): Promise<TargetAudiencesResponse> {
    return await apiClient.get<TargetAudiencesResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async getTargetAudience(pdaDocumentId: number, audienceId: number): Promise<TargetAudienceDetailsResponse> {
    return await apiClient.get<TargetAudienceDetailsResponse>(`${this.getBaseUrl(pdaDocumentId)}/${audienceId}`);
  }

  static async createTargetAudience(pdaDocumentId: number, data: CreateTargetAudienceRequest): Promise<TargetAudienceDetailsResponse> {
    return await apiClient.post<TargetAudienceDetailsResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateTargetAudience(
    pdaDocumentId: number, 
    audienceId: number, 
    data: UpdateTargetAudienceRequest
  ): Promise<TargetAudienceDetailsResponse> {
    return await apiClient.put<TargetAudienceDetailsResponse>(
      `${this.getBaseUrl(pdaDocumentId)}/${audienceId}`, 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteTargetAudience(pdaDocumentId: number, audienceId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${audienceId}`
    );
  }
}

