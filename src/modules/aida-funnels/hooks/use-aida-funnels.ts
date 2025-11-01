import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AidaFunnelsApi } from '../api/aida-funnels';
import { CreateAidaFunnelRequest, UpdateAidaFunnelRequest } from '../types';
import { toast } from 'sonner';

export const aidaFunnelsQueryKeys = {
  all: ['aida-funnels'] as const,
  lists: () => [...aidaFunnelsQueryKeys.all, 'list'] as const,
  list: () => [...aidaFunnelsQueryKeys.lists()] as const,
  details: () => [...aidaFunnelsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...aidaFunnelsQueryKeys.details(), id] as const,
};

export function useAidaFunnels() {
  return useQuery({
    queryKey: aidaFunnelsQueryKeys.list(),
    queryFn: () => AidaFunnelsApi.getAidaFunnels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAidaFunnel(id: number) {
  return useQuery({
    queryKey: aidaFunnelsQueryKeys.detail(id),
    queryFn: () => AidaFunnelsApi.getAidaFunnel(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateAidaFunnel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAidaFunnelRequest) => AidaFunnelsApi.createAidaFunnel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aidaFunnelsQueryKeys.lists() });
      toast.success('AIDA Funnel created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating AIDA funnel:', error);
      toast.error(error?.response?.data?.message || 'Failed to create AIDA funnel');
    },
  });
}

export function useUpdateAidaFunnel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAidaFunnelRequest }) =>
      AidaFunnelsApi.updateAidaFunnel(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: aidaFunnelsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: aidaFunnelsQueryKeys.detail(variables.id) });
      toast.success('AIDA Funnel updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating AIDA funnel:', error);
      toast.error(error?.response?.data?.message || 'Failed to update AIDA funnel');
    },
  });
}

export function useDeleteAidaFunnel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AidaFunnelsApi.deleteAidaFunnel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aidaFunnelsQueryKeys.lists() });
      toast.success('AIDA Funnel deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting AIDA funnel:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete AIDA funnel');
    },
  });
}

// Re-export types for convenience
export type { CreateAidaFunnelRequest, UpdateAidaFunnelRequest, AidaFunnel } from '../types';

