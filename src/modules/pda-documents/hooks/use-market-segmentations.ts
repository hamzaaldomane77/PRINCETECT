import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketSegmentationsApi } from '../api/market-segmentations';
import { CreateMarketSegmentationRequest, UpdateMarketSegmentationRequest } from '../types/market-segmentations';
import { toast } from 'sonner';

export const marketSegmentationsQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'market-segmentations'] as const,
  lists: (pdaDocumentId: number) => [...marketSegmentationsQueryKeys.all(pdaDocumentId), 'list'] as const,
  list: (pdaDocumentId: number) => [...marketSegmentationsQueryKeys.lists(pdaDocumentId)] as const,
  details: (pdaDocumentId: number) => [...marketSegmentationsQueryKeys.all(pdaDocumentId), 'detail'] as const,
  detail: (pdaDocumentId: number, segmentationId: number) => [...marketSegmentationsQueryKeys.details(pdaDocumentId), segmentationId] as const,
};

export function useMarketSegmentations(pdaDocumentId: number) {
  return useQuery({
    queryKey: marketSegmentationsQueryKeys.list(pdaDocumentId),
    queryFn: () => MarketSegmentationsApi.getMarketSegmentations(pdaDocumentId),
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketSegmentation(pdaDocumentId: number, segmentationId: number) {
  return useQuery({
    queryKey: marketSegmentationsQueryKeys.detail(pdaDocumentId, segmentationId),
    queryFn: () => MarketSegmentationsApi.getMarketSegmentation(pdaDocumentId, segmentationId),
    enabled: !!pdaDocumentId && !!segmentationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMarketSegmentation(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMarketSegmentationRequest) => MarketSegmentationsApi.createMarketSegmentation(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketSegmentationsQueryKeys.lists(pdaDocumentId) });
      toast.success('Market Segmentation created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating market segmentation:', error);
      toast.error(error?.response?.data?.message || 'Failed to create market segmentation');
    },
  });
}

export function useUpdateMarketSegmentation(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ segmentationId, data }: { segmentationId: number; data: UpdateMarketSegmentationRequest }) =>
      MarketSegmentationsApi.updateMarketSegmentation(pdaDocumentId, segmentationId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: marketSegmentationsQueryKeys.lists(pdaDocumentId) });
      queryClient.invalidateQueries({ queryKey: marketSegmentationsQueryKeys.detail(pdaDocumentId, variables.segmentationId) });
      toast.success('Market Segmentation updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating market segmentation:', error);
      toast.error(error?.response?.data?.message || 'Failed to update market segmentation');
    },
  });
}

export function useDeleteMarketSegmentation(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (segmentationId: number) => MarketSegmentationsApi.deleteMarketSegmentation(pdaDocumentId, segmentationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketSegmentationsQueryKeys.lists(pdaDocumentId) });
      toast.success('Market Segmentation deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting market segmentation:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete market segmentation');
    },
  });
}

// Re-export types for convenience
export type { CreateMarketSegmentationRequest, UpdateMarketSegmentationRequest } from '../types/market-segmentations';

