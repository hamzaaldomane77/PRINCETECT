import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowTasksAPI } from '../api/workflow-tasks';
import { 
  CreateWorkflowTaskRequest, 
  UpdateWorkflowTaskRequest 
} from '../types';

export const useWorkflowTasks = (
  workflowId: number,
  params: {
    q?: string;
    task_type?: string;
    required?: boolean;
    ordered?: number;
    per_page?: number;
    page?: number;
  } = {}
) => {
  return useQuery({
    queryKey: ['workflowTasks', workflowId, params],
    queryFn: () => WorkflowTasksAPI.getWorkflowTasks(workflowId, params),
    enabled: !!workflowId,
  });
};

export const useWorkflowTask = (workflowId: number, taskId: number) => {
  return useQuery({
    queryKey: ['workflowTask', workflowId, taskId],
    queryFn: () => WorkflowTasksAPI.getWorkflowTask(workflowId, taskId),
    enabled: !!workflowId && !!taskId,
  });
};

export const useCreateWorkflowTask = (workflowId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkflowTaskRequest) =>
      WorkflowTasksAPI.createWorkflowTask(workflowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTasks', workflowId] });
    },
  });
};

export const useUpdateWorkflowTask = (workflowId: number, taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkflowTaskRequest) =>
      WorkflowTasksAPI.updateWorkflowTask(workflowId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTasks', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['workflowTask', workflowId, taskId] });
    },
  });
};

export const useDeleteWorkflowTask = (workflowId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) =>
      WorkflowTasksAPI.deleteWorkflowTask(workflowId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTasks', workflowId] });
    },
  });
};

export const useToggleWorkflowTaskStatus = (workflowId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) =>
      WorkflowTasksAPI.toggleWorkflowTaskStatus(workflowId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTasks', workflowId] });
    },
  });
};

// Lookup hooks
export const useTaskTypesLookup = (workflowId: number) => {
  return useQuery({
    queryKey: ['taskTypesLookup', workflowId],
    queryFn: () => WorkflowTasksAPI.getTaskTypes(workflowId),
    enabled: !!workflowId,
  });
};

export const useTaskDependenciesLookup = (workflowId: number) => {
  return useQuery({
    queryKey: ['taskDependenciesLookup', workflowId],
    queryFn: () => WorkflowTasksAPI.getTaskDependencies(workflowId),
    enabled: !!workflowId,
  });
};
