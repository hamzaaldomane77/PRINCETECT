import { apiClient } from '@/lib/api-client';
import { 
  ToneOfVoiceResponse, 
  CreateToneOfVoiceRequest, 
  UpdateToneOfVoiceRequest 
} from '../types/tone-of-voice';

export class ToneOfVoiceApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/tone-of-voice`;
  }

  static async getToneOfVoice(pdaDocumentId: number): Promise<ToneOfVoiceResponse> {
    return await apiClient.get<ToneOfVoiceResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async createToneOfVoice(pdaDocumentId: number, data: CreateToneOfVoiceRequest): Promise<ToneOfVoiceResponse> {
    return await apiClient.post<ToneOfVoiceResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateToneOfVoice(
    pdaDocumentId: number, 
    data: UpdateToneOfVoiceRequest
  ): Promise<ToneOfVoiceResponse> {
    return await apiClient.put<ToneOfVoiceResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteToneOfVoice(pdaDocumentId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      this.getBaseUrl(pdaDocumentId)
    );
  }
}

