import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SmartGoalsApi } from '../api/smart-goals';
import { CreateSmartGoalRequest, UpdateSmartGoalRequest } from '../types/smart-goals';
import { toast } from 'sonner';

export const smartGoalsQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'smart-goals'] as const,
  lists: (pdaDocumentId: number) => [...smartGoalsQueryKeys.all(pdaDocumentId), 'list'] as const,
  list: (pdaDocumentId: number) => [...smartGoalsQueryKeys.lists(pdaDocumentId)] as const,
  details: (pdaDocumentId: number) => [...smartGoalsQueryKeys.all(pdaDocumentId), 'detail'] as const,
  detail: (pdaDocumentId: number, smartGoalId: number) => [...smartGoalsQueryKeys.details(pdaDocumentId), smartGoalId] as const,
};

export function useSmartGoals(pdaDocumentId: number) {
  return useQuery({
    queryKey: smartGoalsQueryKeys.list(pdaDocumentId),
    queryFn: () => SmartGoalsApi.getSmartGoals(pdaDocumentId),
    enabled: !!pdaDocumentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSmartGoal(pdaDocumentId: number, smartGoalId: number) {
  return useQuery({
    queryKey: smartGoalsQueryKeys.detail(pdaDocumentId, smartGoalId),
    queryFn: () => SmartGoalsApi.getSmartGoal(pdaDocumentId, smartGoalId),
    enabled: !!pdaDocumentId && !!smartGoalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateSmartGoal(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSmartGoalRequest) => SmartGoalsApi.createSmartGoal(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartGoalsQueryKeys.lists(pdaDocumentId) });
      toast.success('Smart Goal created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating smart goal:', error);
      toast.error(error?.response?.data?.message || 'Failed to create smart goal');
    },
  });
}

export function useUpdateSmartGoal(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ smartGoalId, data }: { smartGoalId: number; data: UpdateSmartGoalRequest }) =>
      SmartGoalsApi.updateSmartGoal(pdaDocumentId, smartGoalId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: smartGoalsQueryKeys.lists(pdaDocumentId) });
      queryClient.invalidateQueries({ queryKey: smartGoalsQueryKeys.detail(pdaDocumentId, variables.smartGoalId) });
      toast.success('Smart Goal updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating smart goal:', error);
      toast.error(error?.response?.data?.message || 'Failed to update smart goal');
    },
  });
}

export function useDeleteSmartGoal(pdaDocumentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (smartGoalId: number) => SmartGoalsApi.deleteSmartGoal(pdaDocumentId, smartGoalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smartGoalsQueryKeys.lists(pdaDocumentId) });
      toast.success('Smart Goal deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting smart goal:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete smart goal');
    },
  });
}

// Re-export types for convenience
export type { CreateSmartGoalRequest, UpdateSmartGoalRequest } from '../types/smart-goals';

