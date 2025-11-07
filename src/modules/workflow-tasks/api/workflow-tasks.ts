import { apiClient } from '@/lib/api-client';
import { 
  WorkflowTask, 
  WorkflowTasksResponse, 
  CreateWorkflowTaskRequest, 
  UpdateWorkflowTaskRequest,
  WorkflowTaskLookupResponse 
} from '../types';

export class WorkflowTasksAPI {
  static async getWorkflowTasks(
    workflowId: number,
    params: {
      q?: string;
      task_type?: string;
      required?: boolean;
      ordered?: number;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<WorkflowTasksResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.task_type) queryParams.append('task_type', params.task_type);
    if (params.required !== undefined) queryParams.append('required', params.required.toString());
    if (params.ordered !== undefined) queryParams.append('ordered', params.ordered.toString());
    if (params.per_page !== undefined) queryParams.append('per_page', params.per_page.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/api/v1/admin/service-workflows/${workflowId}/tasks?${queryString}`
      : `/api/v1/admin/service-workflows/${workflowId}/tasks`;
    
    const result = await apiClient.get<WorkflowTasksResponse>(endpoint);
    if (!result.success) {
      throw new Error('Failed to fetch workflow tasks');
    }
    return result;
  }

  static async getWorkflowTask(workflowId: number, taskId: number): Promise<WorkflowTask> {
    const result = await apiClient.get<{ success: boolean; data: WorkflowTask }>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks/${taskId}`
    );
    if (!result.success) {
      throw new Error('Failed to fetch workflow task');
    }
    return result.data;
  }

  static async createWorkflowTask(
    workflowId: number,
    data: CreateWorkflowTaskRequest
  ): Promise<WorkflowTask> {
    const result = await apiClient.post<{ success: boolean; data: WorkflowTask }>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks`,
      data as unknown as Record<string, unknown>
    );
    if (!result.success) {
      throw new Error('Failed to create workflow task');
    }
    return result.data;
  }

  static async updateWorkflowTask(
    workflowId: number,
    taskId: number,
    data: UpdateWorkflowTaskRequest
  ): Promise<WorkflowTask> {
    const result = await apiClient.put<{ success: boolean; data: WorkflowTask }>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks/${taskId}`,
      data as unknown as Record<string, unknown>
    );
    if (!result.success) {
      throw new Error('Failed to update workflow task');
    }
    return result.data;
  }

  static async deleteWorkflowTask(workflowId: number, taskId: number): Promise<void> {
    const result = await apiClient.delete<{ success: boolean }>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks/${taskId}`
    );
    if (!result.success) {
      throw new Error('Failed to delete workflow task');
    }
  }

  static async toggleWorkflowTaskStatus(
    workflowId: number,
    taskId: number
  ): Promise<WorkflowTask> {
    const result = await apiClient.patch<{ success: boolean; data: WorkflowTask }>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks/${taskId}/toggle-status`
    );
    if (!result.success) {
      throw new Error('Failed to toggle workflow task status');
    }
    return result.data;
  }

  // Lookup APIs
  static async getTaskTypes(workflowId: number): Promise<Array<{ value: string; label: string }>> {
    const result = await apiClient.get<WorkflowTaskLookupResponse>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks/lookup/types`
    );
    if (!result.success) {
      throw new Error('Failed to fetch task types');
    }
    return result.data.options.map(option => ({
      value: String(option.value),
      label: option.label
    }));
  }

  static async getTaskDependencies(workflowId: number): Promise<Array<{ value: number; label: string }>> {
    const result = await apiClient.get<WorkflowTaskLookupResponse>(
      `/api/v1/admin/service-workflows/${workflowId}/tasks/lookup/dependencies`
    );
    if (!result.success) {
      throw new Error('Failed to fetch task dependencies');
    }
    return result.data.options.map(option => ({
      value: typeof option.value === 'number' ? option.value : Number(option.value),
      label: option.label
    }));
  }
}
