import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TargetAudiencesApi } from '../api/target-audiences';
import { CreateTargetAudienceRequest, UpdateTargetAudienceRequest } from '../types/target-audiences';
import { toast } from 'sonner';

export const targetAudiencesQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'target-audiences'] as const,
  lists: (pdaDocumentId: number) => [...targetAudiencesQueryKeys.all(pdaDocumentId), 'list'] as const,
  list: (pdaDocumentId: number) => [...targetAudiencesQueryKeys.lists(pdaDocumentId)] as const,
  details: (pdaDocumentId: number) => [...targetAudiencesQueryKeys.all(pdaDocumentId), 'detail'] as const,
  detail: (pdaDocumentId: number, audienceId: number) => [...targetAudiencesQueryKeys.details(pdaDocumentId), audienceId] as const,
};

export function useTargetAudiences(pdaDocumentId: number) {
  return useQuery({
    queryKey: targetAudiencesQueryKeys.list(pdaDocumentId),
    queryFn: () => TargetAudiencesApi.getTargetAudiences(pdaDocumentId),
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTargetAudience(pdaDocumentId: number, audienceId: number) {
  return useQuery({
    queryKey: targetAudiencesQueryKeys.detail(pdaDocumentId, audienceId),
    queryFn: () => TargetAudiencesApi.getTargetAudience(pdaDocumentId, audienceId),
    enabled: !!pdaDocumentId && !!audienceId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTargetAudience(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTargetAudienceRequest) => TargetAudiencesApi.createTargetAudience(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetAudiencesQueryKeys.lists(pdaDocumentId) });
      toast.success('Target Audience created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating target audience:', error);
      toast.error(error?.response?.data?.message || 'Failed to create target audience');
    },
  });
}

export function useUpdateTargetAudience(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ audienceId, data }: { audienceId: number; data: UpdateTargetAudienceRequest }) =>
      TargetAudiencesApi.updateTargetAudience(pdaDocumentId, audienceId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: targetAudiencesQueryKeys.lists(pdaDocumentId) });
      queryClient.invalidateQueries({ queryKey: targetAudiencesQueryKeys.detail(pdaDocumentId, variables.audienceId) });
      toast.success('Target Audience updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating target audience:', error);
      toast.error(error?.response?.data?.message || 'Failed to update target audience');
    },
  });
}

export function useDeleteTargetAudience(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audienceId: number) => TargetAudiencesApi.deleteTargetAudience(pdaDocumentId, audienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetAudiencesQueryKeys.lists(pdaDocumentId) });
      toast.success('Target Audience deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting target audience:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete target audience');
    },
  });
}

// Re-export types for convenience
export type { CreateTargetAudienceRequest, UpdateTargetAudienceRequest } from '../types/target-audiences';

