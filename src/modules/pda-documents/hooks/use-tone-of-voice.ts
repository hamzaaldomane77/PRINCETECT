import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToneOfVoiceApi } from '../api/tone-of-voice';
import { CreateToneOfVoiceRequest, UpdateToneOfVoiceRequest } from '../types/tone-of-voice';
import { toast } from 'sonner';

export const toneOfVoiceQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'tone-of-voice'] as const,
  detail: (pdaDocumentId: number) => [...toneOfVoiceQueryKeys.all(pdaDocumentId), 'detail'] as const,
};

export function useToneOfVoice(pdaDocumentId: number) {
  return useQuery({
    queryKey: toneOfVoiceQueryKeys.detail(pdaDocumentId),
    queryFn: async () => {
      try {
        return await ToneOfVoiceApi.getToneOfVoice(pdaDocumentId);
      } catch (error: any) {
        // If 404, return null instead of throwing (not found is not an error)
        if (error?.status === 404 || error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.status === 404 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCreateToneOfVoice(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateToneOfVoiceRequest) => ToneOfVoiceApi.createToneOfVoice(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toneOfVoiceQueryKeys.all(pdaDocumentId) });
      toast.success('Tone of Voice created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating tone of voice:', error);
      toast.error(error?.response?.data?.message || 'Failed to create tone of voice');
    },
  });
}

export function useUpdateToneOfVoice(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateToneOfVoiceRequest) =>
      ToneOfVoiceApi.updateToneOfVoice(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toneOfVoiceQueryKeys.all(pdaDocumentId) });
      toast.success('Tone of Voice updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating tone of voice:', error);
      toast.error(error?.response?.data?.message || 'Failed to update tone of voice');
    },
  });
}

export function useDeleteToneOfVoice(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ToneOfVoiceApi.deleteToneOfVoice(pdaDocumentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: toneOfVoiceQueryKeys.all(pdaDocumentId) });
      toast.success('Tone of Voice deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting tone of voice:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete tone of voice');
    },
  });
}

// Re-export types for convenience
export type { CreateToneOfVoiceRequest, UpdateToneOfVoiceRequest } from '../types/tone-of-voice';

