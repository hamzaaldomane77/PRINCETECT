import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketingMixesApi } from '../api/marketing-mixes';
import {
  CreateMarketingMixRequest,
  UpdateMarketingMixRequest,
  MarketingMixFilters,
} from '../types';
import { toast } from 'sonner';

// Query Keys
export const marketingMixesQueryKeys = {
  all: ['marketing-mixes'] as const,
  lists: () => [...marketingMixesQueryKeys.all, 'list'] as const,
  list: (filters?: MarketingMixFilters) => [...marketingMixesQueryKeys.lists(), { filters }] as const,
  details: () => [...marketingMixesQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...marketingMixesQueryKeys.details(), id] as const,
};

// Get all marketing mixes
export function useMarketingMixes(filters?: MarketingMixFilters) {
  return useQuery({
    queryKey: marketingMixesQueryKeys.list(filters),
    queryFn: () => MarketingMixesApi.getMarketingMixes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single marketing mix
export function useMarketingMix(id: number) {
  return useQuery({
    queryKey: marketingMixesQueryKeys.detail(id),
    queryFn: () => MarketingMixesApi.getMarketingMix(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create marketing mix
export function useCreateMarketingMix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMarketingMixRequest) => MarketingMixesApi.createMarketingMix(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingMixesQueryKeys.lists() });
      toast.success('Marketing mix created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating marketing mix:', error);
      toast.error(error?.response?.data?.message || 'Failed to create marketing mix');
    },
  });
}

// Update marketing mix
export function useUpdateMarketingMix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMarketingMixRequest }) =>
      MarketingMixesApi.updateMarketingMix(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: marketingMixesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketingMixesQueryKeys.detail(variables.id) });
      toast.success('Marketing mix updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating marketing mix:', error);
      toast.error(error?.response?.data?.message || 'Failed to update marketing mix');
    },
  });
}

// Delete marketing mix
export function useDeleteMarketingMix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MarketingMixesApi.deleteMarketingMix(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingMixesQueryKeys.lists() });
      toast.success('Marketing mix deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting marketing mix:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete marketing mix');
    },
  });
}

