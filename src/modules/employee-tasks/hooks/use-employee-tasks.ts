import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeTasksAPI } from '../api/employee-tasks';
import {
  EmployeeTasksFilters,
  UpdateTaskStatusRequest,
} from '../types';

// Query keys
export const employeeTasksQueryKeys = {
  all: ['employee-tasks'] as const,
  lists: () => [...employeeTasksQueryKeys.all, 'list'] as const,
  list: (filters?: EmployeeTasksFilters) => [...employeeTasksQueryKeys.lists(), filters] as const,
  details: () => [...employeeTasksQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeTasksQueryKeys.details(), id] as const,
};

// Get all employee tasks
export function useEmployeeTasks(filters?: EmployeeTasksFilters) {
  return useQuery({
    queryKey: employeeTasksQueryKeys.list(filters),
    queryFn: () => EmployeeTasksAPI.getEmployeeTasks(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single task details
export function useEmployeeTask(taskId: number) {
  return useQuery({
    queryKey: employeeTasksQueryKeys.detail(taskId),
    queryFn: () => EmployeeTasksAPI.getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 30 * 1000,
  });
}

// Update task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskStatusRequest }) =>
      EmployeeTasksAPI.updateTaskStatus(taskId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'calendar'] });
    },
  });
}

// Get calendar tasks
export function useCalendarTasks(view: 'month' | 'week' | 'day', date: string) {
  return useQuery({
    queryKey: ['employee-tasks', 'calendar', view, date] as const,
    queryFn: () => EmployeeTasksAPI.getCalendarTasks(view, date),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: any }) =>
      EmployeeTasksAPI.updateTask(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'workload'] });
    },
  });
}

// Start task
export function useStartTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => EmployeeTasksAPI.startTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'workload'] });
    },
  });
}

// Complete task
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data?: { actual_hours?: number; feedback?: string } }) => 
      EmployeeTasksAPI.completeTask(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'workload'] });
    },
  });
}

// Hold task
export function useHoldTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data?: { reason?: string } }) => 
      EmployeeTasksAPI.holdTask(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeTasksQueryKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['employee-tasks', 'workload'] });
    },
  });
}

// Get workload
export function useWorkload() {
  return useQuery({
    queryKey: ['employee-tasks', 'workload'] as const,
    queryFn: () => EmployeeTasksAPI.getWorkload(),
    staleTime: 60 * 1000, // 1 minute
  });
}

