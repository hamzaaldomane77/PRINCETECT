import { apiClient } from '@/lib/api-client';
import { 
  MarketChallengesResponse, 
  MarketChallengeDetailsResponse, 
  CreateMarketChallengeRequest, 
  UpdateMarketChallengeRequest 
} from '../types/market-challenges';

export class MarketChallengesApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/market-challenges`;
  }

  static async getMarketChallenges(pdaDocumentId: number): Promise<MarketChallengesResponse> {
    return await apiClient.get<MarketChallengesResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async getMarketChallenge(pdaDocumentId: number, challengeId: number): Promise<MarketChallengeDetailsResponse> {
    return await apiClient.get<MarketChallengeDetailsResponse>(`${this.getBaseUrl(pdaDocumentId)}/${challengeId}`);
  }

  static async createMarketChallenge(pdaDocumentId: number, data: CreateMarketChallengeRequest): Promise<MarketChallengeDetailsResponse> {
    return await apiClient.post<MarketChallengeDetailsResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateMarketChallenge(
    pdaDocumentId: number, 
    challengeId: number, 
    data: UpdateMarketChallengeRequest
  ): Promise<MarketChallengeDetailsResponse> {
    return await apiClient.put<MarketChallengeDetailsResponse>(
      `${this.getBaseUrl(pdaDocumentId)}/${challengeId}`, 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteMarketChallenge(pdaDocumentId: number, challengeId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${challengeId}`
    );
  }
}

