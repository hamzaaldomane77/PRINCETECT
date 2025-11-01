import { apiClient } from '@/lib/api-client';
import { 
  SmartGoalsResponse, 
  SmartGoalDetailsResponse, 
  CreateSmartGoalRequest, 
  UpdateSmartGoalRequest 
} from '../types/smart-goals';

export class SmartGoalsApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/smart-goals`;
  }

  static async getSmartGoals(pdaDocumentId: number): Promise<SmartGoalsResponse> {
    return await apiClient.get<SmartGoalsResponse>(this.getBaseUrl(pdaDocumentId));
  }

  static async getSmartGoal(pdaDocumentId: number, smartGoalId: number): Promise<SmartGoalDetailsResponse> {
    return await apiClient.get<SmartGoalDetailsResponse>(`${this.getBaseUrl(pdaDocumentId)}/${smartGoalId}`);
  }

  static async createSmartGoal(pdaDocumentId: number, data: CreateSmartGoalRequest): Promise<SmartGoalDetailsResponse> {
    return await apiClient.post<SmartGoalDetailsResponse>(
      this.getBaseUrl(pdaDocumentId), 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateSmartGoal(
    pdaDocumentId: number, 
    smartGoalId: number, 
    data: UpdateSmartGoalRequest
  ): Promise<SmartGoalDetailsResponse> {
    return await apiClient.put<SmartGoalDetailsResponse>(
      `${this.getBaseUrl(pdaDocumentId)}/${smartGoalId}`, 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteSmartGoal(pdaDocumentId: number, smartGoalId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${smartGoalId}`
    );
  }
}

