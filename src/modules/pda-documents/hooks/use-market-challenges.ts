import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketChallengesApi } from '../api/market-challenges';
import { CreateMarketChallengeRequest, UpdateMarketChallengeRequest } from '../types/market-challenges';
import { toast } from 'sonner';

export const marketChallengesQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'market-challenges'] as const,
  lists: (pdaDocumentId: number) => [...marketChallengesQueryKeys.all(pdaDocumentId), 'list'] as const,
  list: (pdaDocumentId: number) => [...marketChallengesQueryKeys.lists(pdaDocumentId)] as const,
  details: (pdaDocumentId: number) => [...marketChallengesQueryKeys.all(pdaDocumentId), 'detail'] as const,
  detail: (pdaDocumentId: number, challengeId: number) => [...marketChallengesQueryKeys.details(pdaDocumentId), challengeId] as const,
};

export function useMarketChallenges(pdaDocumentId: number) {
  return useQuery({
    queryKey: marketChallengesQueryKeys.list(pdaDocumentId),
    queryFn: () => MarketChallengesApi.getMarketChallenges(pdaDocumentId),
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketChallenge(pdaDocumentId: number, challengeId: number) {
  return useQuery({
    queryKey: marketChallengesQueryKeys.detail(pdaDocumentId, challengeId),
    queryFn: () => MarketChallengesApi.getMarketChallenge(pdaDocumentId, challengeId),
    enabled: !!pdaDocumentId && !!challengeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMarketChallenge(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarketChallengeRequest) => MarketChallengesApi.createMarketChallenge(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketChallengesQueryKeys.lists(pdaDocumentId) });
      toast.success('Market Challenge created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating market challenge:', error);
      toast.error(error?.response?.data?.message || 'Failed to create market challenge');
    },
  });
}

export function useUpdateMarketChallenge(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, data }: { challengeId: number; data: UpdateMarketChallengeRequest }) =>
      MarketChallengesApi.updateMarketChallenge(pdaDocumentId, challengeId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: marketChallengesQueryKeys.lists(pdaDocumentId) });
      queryClient.invalidateQueries({ queryKey: marketChallengesQueryKeys.detail(pdaDocumentId, variables.challengeId) });
      toast.success('Market Challenge updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating market challenge:', error);
      toast.error(error?.response?.data?.message || 'Failed to update market challenge');
    },
  });
}

export function useDeleteMarketChallenge(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: number) => MarketChallengesApi.deleteMarketChallenge(pdaDocumentId, challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketChallengesQueryKeys.lists(pdaDocumentId) });
      toast.success('Market Challenge deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting market challenge:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete market challenge');
    },
  });
}

// Re-export types for convenience
export type { CreateMarketChallengeRequest, UpdateMarketChallengeRequest } from '../types/market-challenges';

