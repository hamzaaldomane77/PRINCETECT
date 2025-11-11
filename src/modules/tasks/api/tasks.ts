import { apiClient } from '@/lib/api-client';
import {
  TasksResponse,
  TaskDetailsResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskLookupResponse,
  AssignTaskRequest,
  BulkAssignTasksRequest,
  Task,
} from '../types';

const API_BASE = '/api/v1/admin/tasks';

export class TasksAPI {
  // Get all tasks
  static async getTasks(params?: {
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
  }): Promise<TasksResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.q) queryParams.append('q', params.q);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.task_type) queryParams.append('task_type', params.task_type);
    if (params?.assigned_employee_id) queryParams.append('assigned_employee_id', params.assigned_employee_id.toString());
    if (params?.contract_service_workflow_id) queryParams.append('contract_service_workflow_id', params.contract_service_workflow_id.toString());
    if (params?.overdue === true) queryParams.append('overdue', 'true');
    if (params?.unassigned === true) queryParams.append('unassigned', 'true');
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<TasksResponse>(endpoint);
  }

  // Get task by ID
  static async getTaskById(id: number): Promise<Task> {
    const result = await apiClient.get<TaskDetailsResponse>(`${API_BASE}/${id}`);
    if (!result.success) {
      throw new Error('Failed to fetch task');
    }
    return result.data.task;
  }

  // Create new task
  static async createTask(data: CreateTaskRequest): Promise<Task> {
    const result = await apiClient.post<{ success: boolean; data: { task: Task } }>(
      API_BASE,
      data as unknown as Record<string, unknown>
    );
    if (!result.success) {
      throw new Error('Failed to create task');
    }
    return result.data.task;
  }

  // Update task
  static async updateTask(id: number, data: UpdateTaskRequest): Promise<Task> {
    const result = await apiClient.put<{ success: boolean; data: { task: Task } }>(
      `${API_BASE}/${id}`,
      data as unknown as Record<string, unknown>
    );
    if (!result.success) {
      throw new Error('Failed to update task');
    }
    return result.data.task;
  }

  // Delete task
  static async deleteTask(id: number): Promise<void> {
    const result = await apiClient.delete<{ success: boolean }>(`${API_BASE}/${id}`);
    if (!result.success) {
      throw new Error('Failed to delete task');
    }
  }

  // Get employees lookup for task assignment
  static async getEmployeesLookup(): Promise<Array<{ value: number; label: string }>> {
    const result = await apiClient.get<TaskLookupResponse>(`${API_BASE}/lookup/employees`);
    if (!result.success) {
      throw new Error('Failed to fetch employees lookup');
    }
    return result.data.options;
  }

  // Get task types lookup - using static list since API endpoint doesn't exist
  static async getTaskTypesLookup(): Promise<Array<{ value: string; label: string }>> {
    // Return static list of task types
    return [
      { value: 'script_writing', label: 'Script Writing' },
      { value: 'filming', label: 'Filming' },
      { value: 'editing', label: 'Editing' },
      { value: 'design', label: 'Design' },
      { value: 'voice_over', label: 'Voice Over' },
      { value: 'animation', label: 'Animation' },
      { value: 'sound_design', label: 'Sound Design' },
      { value: 'review', label: 'Review' },
      { value: 'research', label: 'Research' },
      { value: 'content_creation', label: 'Content Creation' },
      { value: 'communication', label: 'Communication' },
    ];
  }

  // Get workflows lookup - using service workflows API
  static async getWorkflowsLookup(): Promise<Array<{ value: number; label: string }>> {
    try {
      // Try to get workflows from service workflows API
      const { ServiceWorkflowsAPI } = await import('@/modules/service-workflows/api/service-workflows');
      const result = await ServiceWorkflowsAPI.getServiceWorkflows({ per_page: 100 });
      if (result.success && result.data.workflows) {
        return result.data.workflows.map(workflow => ({
          value: workflow.id,
          label: workflow.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch workflows lookup:', error);
      return [];
    }
  }

  // Assign task to employee
  static async assignTask(taskId: number, data: AssignTaskRequest): Promise<Task> {
    const result = await apiClient.post<{ success: boolean; data: { task: Task } }>(
      `${API_BASE}/${taskId}/assign`,
      data as unknown as Record<string, unknown>
    );
    if (!result.success) {
      throw new Error('Failed to assign task');
    }
    return result.data.task;
  }

  // Bulk assign tasks to employee
  static async bulkAssignTasks(data: BulkAssignTasksRequest): Promise<{ success: boolean; message?: string }> {
    const result = await apiClient.post<{ success: boolean; message?: string }>(
      `${API_BASE}/bulk-assign`,
      data as unknown as Record<string, unknown>
    );
    if (!result.success) {
      throw new Error('Failed to bulk assign tasks');
    }
    return result;
  }
}

