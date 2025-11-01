import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CompetitorsApi } from '../api/competitors';
import { CreateCompetitorRequest, UpdateCompetitorRequest } from '../types/competitors';
import { toast } from 'sonner';

export const competitorsQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'competitors'] as const,
  lists: (pdaDocumentId: number) => [...competitorsQueryKeys.all(pdaDocumentId), 'list'] as const,
  list: (pdaDocumentId: number) => [...competitorsQueryKeys.lists(pdaDocumentId)] as const,
  details: (pdaDocumentId: number) => [...competitorsQueryKeys.all(pdaDocumentId), 'detail'] as const,
  detail: (pdaDocumentId: number, competitorId: number) => [...competitorsQueryKeys.details(pdaDocumentId), competitorId] as const,
};

export function useCompetitors(pdaDocumentId: number) {
  return useQuery({
    queryKey: competitorsQueryKeys.list(pdaDocumentId),
    queryFn: () => CompetitorsApi.getCompetitors(pdaDocumentId),
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompetitor(pdaDocumentId: number, competitorId: number) {
  return useQuery({
    queryKey: competitorsQueryKeys.detail(pdaDocumentId, competitorId),
    queryFn: () => CompetitorsApi.getCompetitor(pdaDocumentId, competitorId),
    enabled: !!pdaDocumentId && !!competitorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCompetitor(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompetitorRequest) => CompetitorsApi.createCompetitor(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitorsQueryKeys.lists(pdaDocumentId) });
      toast.success('Competitor created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating competitor:', error);
      toast.error(error?.response?.data?.message || 'Failed to create competitor');
    },
  });
}

export function useUpdateCompetitor(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ competitorId, data }: { competitorId: number; data: UpdateCompetitorRequest }) =>
      CompetitorsApi.updateCompetitor(pdaDocumentId, competitorId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: competitorsQueryKeys.lists(pdaDocumentId) });
      queryClient.invalidateQueries({ queryKey: competitorsQueryKeys.detail(pdaDocumentId, variables.competitorId) });
      toast.success('Competitor updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating competitor:', error);
      toast.error(error?.response?.data?.message || 'Failed to update competitor');
    },
  });
}

export function useDeleteCompetitor(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competitorId: number) => CompetitorsApi.deleteCompetitor(pdaDocumentId, competitorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitorsQueryKeys.lists(pdaDocumentId) });
      toast.success('Competitor deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting competitor:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete competitor');
    },
  });
}

// Re-export types for convenience
export type { CreateCompetitorRequest, UpdateCompetitorRequest } from '../types/competitors';

