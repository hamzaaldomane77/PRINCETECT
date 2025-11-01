import { apiClient } from '@/lib/api-client';
import {
  MarketingChannel,
  MarketingChannelsResponse,
  MarketingChannelDetailsResponse,
  CreateMarketingChannelRequest,
  UpdateMarketingChannelRequest,
  MarketingChannelFilters,
  OnlineChannel,
  OfflineChannel,
  Influencer,
  CreateOnlineChannelRequest,
  UpdateOnlineChannelRequest,
  CreateOfflineChannelRequest,
  UpdateOfflineChannelRequest,
  CreateInfluencerRequest,
  UpdateInfluencerRequest,
} from '../types';

export class MarketingChannelsApi {
  private static baseUrl = '/api/v1/admin/marketing-channels';

  // Get all marketing channels
  static async getMarketingChannels(filters?: MarketingChannelFilters): Promise<MarketingChannelsResponse> {
    const params = new URLSearchParams();

    if (filters?.pda_document_id) params.append('pda_document_id', filters.pda_document_id.toString());
    if (filters?.channel_type) params.append('channel_type', filters.channel_type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return await apiClient.get<MarketingChannelsResponse>(url);
  }

  // Get single marketing channel
  static async getMarketingChannel(id: number): Promise<MarketingChannelDetailsResponse> {
    return await apiClient.get<MarketingChannelDetailsResponse>(`${this.baseUrl}/${id}`);
  }

  // Create marketing channel
  static async createMarketingChannel(data: CreateMarketingChannelRequest): Promise<{ success: boolean; data: MarketingChannel; message: string }> {
    return await apiClient.post<{ success: boolean; data: MarketingChannel; message: string }>(
      this.baseUrl,
      data as unknown as Record<string, unknown>
    );
  }

  // Update marketing channel
  static async updateMarketingChannel(
    id: number,
    data: UpdateMarketingChannelRequest
  ): Promise<{ success: boolean; data: MarketingChannel; message: string }> {
    return await apiClient.put<{ success: boolean; data: MarketingChannel; message: string }>(
      `${this.baseUrl}/${id}`,
      data as unknown as Record<string, unknown>
    );
  }

  // Delete marketing channel
  static async deleteMarketingChannel(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  // Online Channels
  static async createOnlineChannel(
    marketingChannelId: number,
    data: CreateOnlineChannelRequest
  ): Promise<{ success: boolean; data: OnlineChannel; message: string }> {
    return await apiClient.post<{ success: boolean; data: OnlineChannel; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/online-channels`,
      data as unknown as Record<string, unknown>
    );
  }

  static async updateOnlineChannel(
    marketingChannelId: number,
    onlineChannelId: number,
    data: UpdateOnlineChannelRequest
  ): Promise<{ success: boolean; data: OnlineChannel; message: string }> {
    return await apiClient.put<{ success: boolean; data: OnlineChannel; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/online-channels/${onlineChannelId}`,
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteOnlineChannel(
    marketingChannelId: number,
    onlineChannelId: number
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/online-channels/${onlineChannelId}`
    );
  }

  // Offline Channels
  static async createOfflineChannel(
    marketingChannelId: number,
    data: CreateOfflineChannelRequest
  ): Promise<{ success: boolean; data: OfflineChannel; message: string }> {
    return await apiClient.post<{ success: boolean; data: OfflineChannel; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/offline-channels`,
      data as unknown as Record<string, unknown>
    );
  }

  static async updateOfflineChannel(
    marketingChannelId: number,
    offlineChannelId: number,
    data: UpdateOfflineChannelRequest
  ): Promise<{ success: boolean; data: OfflineChannel; message: string }> {
    return await apiClient.put<{ success: boolean; data: OfflineChannel; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/offline-channels/${offlineChannelId}`,
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteOfflineChannel(
    marketingChannelId: number,
    offlineChannelId: number
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/offline-channels/${offlineChannelId}`
    );
  }

  // Influencers
  static async createInfluencer(
    marketingChannelId: number,
    data: CreateInfluencerRequest
  ): Promise<{ success: boolean; data: Influencer; message: string }> {
    return await apiClient.post<{ success: boolean; data: Influencer; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/influencers`,
      data as unknown as Record<string, unknown>
    );
  }

  static async updateInfluencer(
    marketingChannelId: number,
    influencerId: number,
    data: UpdateInfluencerRequest
  ): Promise<{ success: boolean; data: Influencer; message: string }> {
    return await apiClient.put<{ success: boolean; data: Influencer; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/influencers/${influencerId}`,
      data as unknown as Record<string, unknown>
    );
  }

  static async deleteInfluencer(
    marketingChannelId: number,
    influencerId: number
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${marketingChannelId}/influencers/${influencerId}`
    );
  }
}

