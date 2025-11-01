import { apiClient } from '@/lib/api-client';
import { 
  AidaFunnelsResponse, 
  AidaFunnelDetailsResponse, 
  CreateAidaFunnelRequest, 
  UpdateAidaFunnelRequest 
} from '../types';

export class AidaFunnelsApi {
  private static baseUrl = '/api/v1/admin/aida-funnels';

  static async getAidaFunnels(): Promise<AidaFunnelsResponse> {
    return await apiClient.get<AidaFunnelsResponse>(this.baseUrl);
  }

  static async getAidaFunnel(id: number): Promise<AidaFunnelDetailsResponse> {
    return await apiClient.get<AidaFunnelDetailsResponse>(`${this.baseUrl}/${id}`);
  }

  static async createAidaFunnel(data: CreateAidaFunnelRequest): Promise<AidaFunnelDetailsResponse> {
    return await apiClient.post<AidaFunnelDetailsResponse>(
      this.baseUrl, 
      data as unknown as Record<string, unknown>
    );
  }

  static async updateAidaFunnel(id: number, data: UpdateAidaFunnelRequest): Promise<AidaFunnelDetailsResponse> {
    return await apiClient.put<AidaFunnelDetailsResponse>(
      `${this.baseUrl}/${id}`, 
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteAidaFunnel(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}

