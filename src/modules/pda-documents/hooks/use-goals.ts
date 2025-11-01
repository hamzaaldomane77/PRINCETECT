import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalsApi } from '../api/goals';
import { CreateGoalRequest, UpdateGoalRequest } from '../types/goals';

// Query Keys
export const goalsQueryKeys = {
  all: (pdaDocumentId: number) => ['pda-documents', pdaDocumentId, 'goals'] as const,
  lists: (pdaDocumentId: number) => [...goalsQueryKeys.all(pdaDocumentId), 'list'] as const,
  details: (pdaDocumentId: number) => [...goalsQueryKeys.all(pdaDocumentId), 'detail'] as const,
  detail: (pdaDocumentId: number, goalId: number) =>
    [...goalsQueryKeys.details(pdaDocumentId), goalId] as const,
};

// Get all goals for a PDA document
export function useGoals(pdaDocumentId: number) {
  return useQuery({
    queryKey: goalsQueryKeys.lists(pdaDocumentId),
    queryFn: () => GoalsApi.getGoals(pdaDocumentId),
    enabled: !!pdaDocumentId && pdaDocumentId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single goal
export function useGoal(pdaDocumentId: number, goalId: number) {
  return useQuery({
    queryKey: goalsQueryKeys.detail(pdaDocumentId, goalId),
    queryFn: () => GoalsApi.getGoal(pdaDocumentId, goalId),
    enabled: !!pdaDocumentId && pdaDocumentId > 0 && !!goalId && goalId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create goal
export function useCreateGoal(pdaDocumentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => GoalsApi.createGoal(pdaDocumentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.lists(pdaDocumentId) });
    },
  });
}

// Update goal
export function useUpdateGoal(pdaDocumentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: number; data: UpdateGoalRequest }) =>
      GoalsApi.updateGoal(pdaDocumentId, goalId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.lists(pdaDocumentId) });
      queryClient.invalidateQueries({
        queryKey: goalsQueryKeys.detail(pdaDocumentId, variables.goalId),
      });
    },
  });
}

// Delete goal
export function useDeleteGoal(pdaDocumentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: number) => GoalsApi.deleteGoal(pdaDocumentId, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsQueryKeys.lists(pdaDocumentId) });
      toast.success('Goal deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting goal:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete goal');
    },
  });
}

// Re-export types for convenience
export type { CreateGoalRequest, UpdateGoalRequest } from '../types/goals';

