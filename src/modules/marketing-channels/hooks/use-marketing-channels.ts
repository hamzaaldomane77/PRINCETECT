import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketingChannelsApi } from '../api/marketing-channels';
import {
  CreateMarketingChannelRequest,
  UpdateMarketingChannelRequest,
  MarketingChannelFilters,
  CreateOnlineChannelRequest,
  UpdateOnlineChannelRequest,
  CreateOfflineChannelRequest,
  UpdateOfflineChannelRequest,
  CreateInfluencerRequest,
  UpdateInfluencerRequest,
} from '../types';

// Query Keys
export const marketingChannelsQueryKeys = {
  all: ['marketing-channels'] as const,
  lists: () => [...marketingChannelsQueryKeys.all, 'list'] as const,
  list: (filters?: MarketingChannelFilters) => [...marketingChannelsQueryKeys.lists(), { filters }] as const,
  details: () => [...marketingChannelsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...marketingChannelsQueryKeys.details(), id] as const,
};

// Get all marketing channels
export function useMarketingChannels(filters?: MarketingChannelFilters) {
  return useQuery({
    queryKey: marketingChannelsQueryKeys.list(filters),
    queryFn: () => MarketingChannelsApi.getMarketingChannels(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single marketing channel
export function useMarketingChannel(id: number) {
  return useQuery({
    queryKey: marketingChannelsQueryKeys.detail(id),
    queryFn: () => MarketingChannelsApi.getMarketingChannel(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create marketing channel
export function useCreateMarketingChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMarketingChannelRequest) => MarketingChannelsApi.createMarketingChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

// Update marketing channel
export function useUpdateMarketingChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMarketingChannelRequest }) =>
      MarketingChannelsApi.updateMarketingChannel(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(variables.id) });
    },
  });
}

// Delete marketing channel
export function useDeleteMarketingChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MarketingChannelsApi.deleteMarketingChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

// Online Channels Hooks
export function useCreateOnlineChannel(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOnlineChannelRequest) =>
      MarketingChannelsApi.createOnlineChannel(marketingChannelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

export function useUpdateOnlineChannel(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOnlineChannelRequest }) =>
      MarketingChannelsApi.updateOnlineChannel(marketingChannelId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

export function useDeleteOnlineChannel(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MarketingChannelsApi.deleteOnlineChannel(marketingChannelId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

// Offline Channels Hooks
export function useCreateOfflineChannel(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfflineChannelRequest) =>
      MarketingChannelsApi.createOfflineChannel(marketingChannelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

export function useUpdateOfflineChannel(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOfflineChannelRequest }) =>
      MarketingChannelsApi.updateOfflineChannel(marketingChannelId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

export function useDeleteOfflineChannel(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MarketingChannelsApi.deleteOfflineChannel(marketingChannelId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

// Influencers Hooks
export function useCreateInfluencer(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInfluencerRequest) =>
      MarketingChannelsApi.createInfluencer(marketingChannelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

export function useUpdateInfluencer(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInfluencerRequest }) =>
      MarketingChannelsApi.updateInfluencer(marketingChannelId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

export function useDeleteInfluencer(marketingChannelId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MarketingChannelsApi.deleteInfluencer(marketingChannelId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.detail(marketingChannelId) });
      queryClient.invalidateQueries({ queryKey: marketingChannelsQueryKeys.lists() });
    },
  });
}

