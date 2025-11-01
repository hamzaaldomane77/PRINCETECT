import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SwotApi } from '../api/swot';
import { SaveSwotAnalysisRequest } from '../types/swot';
import { toast } from 'sonner';

export const swotQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'swot'] as const,
  detail: (pdaDocumentId: number) => [...swotQueryKeys.all(pdaDocumentId), 'detail'] as const,
};

export function useSwotAnalysis(pdaDocumentId: number) {
  return useQuery({
    queryKey: swotQueryKeys.detail(pdaDocumentId),
    queryFn: async () => {
      try {
        return await SwotApi.getSwotAnalysis(pdaDocumentId);
      } catch (error: any) {
        // If it's a 404 or "not found" message, return null - means SWOT doesn't exist yet
        const isNotFound = 
          error?.response?.status === 404 || 
          error?.status === 404 ||
          error?.response?.data?.success === false && 
          (error?.response?.data?.message?.toLowerCase().includes('not found') ||
           error?.response?.data?.message?.toLowerCase().includes('swot analysis not found'));
        
        if (isNotFound) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on "not found" errors
      const isNotFound = 
        error?.response?.status === 404 || 
        error?.status === 404 ||
        error?.response?.data?.success === false && 
        (error?.response?.data?.message?.toLowerCase().includes('not found') ||
         error?.response?.data?.message?.toLowerCase().includes('swot analysis not found'));
      
      if (isNotFound) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useSaveSwotAnalysis(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveSwotAnalysisRequest) => SwotApi.saveSwotAnalysis(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: swotQueryKeys.all(pdaDocumentId) });
      toast.success('SWOT Analysis saved successfully');
    },
    onError: (error: any) => {
      console.error('Error saving SWOT analysis:', error);
      toast.error(error?.response?.data?.message || 'Failed to save SWOT analysis');
    },
  });
}

