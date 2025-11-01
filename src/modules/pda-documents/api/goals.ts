import { apiClient } from '@/lib/api-client';
import {
  Goal,
  GoalsResponse,
  GoalDetailsResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
} from '../types/goals';

export class GoalsApi {
  private static getBaseUrl(pdaDocumentId: number) {
    return `/api/v1/admin/pda-documents/${pdaDocumentId}/goals`;
  }

  // Get all goals for a PDA document
  static async getGoals(pdaDocumentId: number): Promise<GoalsResponse> {
    return await apiClient.get<GoalsResponse>(this.getBaseUrl(pdaDocumentId));
  }

  // Get single goal
  static async getGoal(pdaDocumentId: number, goalId: number): Promise<GoalDetailsResponse> {
    return await apiClient.get<GoalDetailsResponse>(`${this.getBaseUrl(pdaDocumentId)}/${goalId}`);
  }

  // Create goal
  static async createGoal(
    pdaDocumentId: number,
    data: CreateGoalRequest
  ): Promise<{ success: boolean; data: Goal; message: string }> {
    return await apiClient.post<{ success: boolean; data: Goal; message: string }>(
      this.getBaseUrl(pdaDocumentId),
      data as unknown as Record<string, unknown>
    );
  }

  // Update goal
  static async updateGoal(
    pdaDocumentId: number,
    goalId: number,
    data: UpdateGoalRequest
  ): Promise<{ success: boolean; data: Goal; message: string }> {
    return await apiClient.put<{ success: boolean; data: Goal; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${goalId}`,
      data as unknown as Record<string, unknown>
    );
  }

  // Delete goal
  static async deleteGoal(
    pdaDocumentId: number,
    goalId: number
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.getBaseUrl(pdaDocumentId)}/${goalId}`
    );
  }
}

