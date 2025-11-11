import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksAPI } from '../api/tasks';
import { CreateTaskRequest, UpdateTaskRequest, AssignTaskRequest, BulkAssignTasksRequest } from '../types';

// Query keys
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (params?: any) => [...tasksKeys.lists(), params] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: number) => [...tasksKeys.details(), id] as const,
  lookups: () => [...tasksKeys.all, 'lookup'] as const,
  employeesLookup: () => [...tasksKeys.lookups(), 'employees'] as const,
};

// Get all tasks
export const useTasks = (params?: {
  q?: string;
  status?: string;
  priority?: string;
  task_type?: string;
  assigned_employee_id?: number;
  contract_service_workflow_id?: number;
  overdue?: boolean;
  unassigned?: boolean;
  per_page?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: tasksKeys.list(params),
    queryFn: () => TasksAPI.getTasks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single task by ID
export const useTask = (id: number) => {
  return useQuery({
    queryKey: tasksKeys.detail(id),
    queryFn: () => TasksAPI.getTaskById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => TasksAPI.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
    },
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) => 
      TasksAPI.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(id) });
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => TasksAPI.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
    },
  });
};

// Get employees lookup
export const useEmployeesLookup = () => {
  return useQuery({
    queryKey: tasksKeys.employeesLookup(),
    queryFn: () => TasksAPI.getEmployeesLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get task types lookup
export const useTaskTypesLookup = () => {
  return useQuery({
    queryKey: [...tasksKeys.lookups(), 'task-types'],
    queryFn: () => TasksAPI.getTaskTypesLookup(),
    staleTime: Infinity, // Static data, never stale
    retry: false, // Don't retry on error since it's static
  });
};

// Get workflows lookup
export const useWorkflowsLookup = () => {
  return useQuery({
    queryKey: [...tasksKeys.lookups(), 'workflows'],
    queryFn: () => TasksAPI.getWorkflowsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Retry once on error
  });
};

// Assign task to employee
export const useAssignTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: AssignTaskRequest }) => 
      TasksAPI.assignTask(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(taskId) });
    },
  });
};

// Bulk assign tasks to employee
export const useBulkAssignTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkAssignTasksRequest) => TasksAPI.bulkAssignTasks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
    },
  });
};

