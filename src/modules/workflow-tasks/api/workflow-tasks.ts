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
    const result = await apiClient.get<WorkflowTasksResponse>(
      `/admin/service-workflows/${workflowId}/tasks`,
      params
    );
    if (!result.success) {
      throw new Error('Failed to fetch workflow tasks');
    }
    return result;
  }

  static async getWorkflowTask(workflowId: number, taskId: number): Promise<WorkflowTask> {
    const result = await apiClient.get<{ success: boolean; data: WorkflowTask }>(
      `/admin/service-workflows/${workflowId}/tasks/${taskId}`
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
      `/admin/service-workflows/${workflowId}/tasks`,
      data
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
      `/admin/service-workflows/${workflowId}/tasks/${taskId}`,
      data
    );
    if (!result.success) {
      throw new Error('Failed to update workflow task');
    }
    return result.data;
  }

  static async deleteWorkflowTask(workflowId: number, taskId: number): Promise<void> {
    const result = await apiClient.delete<{ success: boolean }>(
      `/admin/service-workflows/${workflowId}/tasks/${taskId}`
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
      `/admin/service-workflows/${workflowId}/tasks/${taskId}/toggle-status`
    );
    if (!result.success) {
      throw new Error('Failed to toggle workflow task status');
    }
    return result.data;
  }

  // Lookup APIs
  static async getTaskTypes(workflowId: number): Promise<Array<{ value: string; label: string }>> {
    const result = await apiClient.get<WorkflowTaskLookupResponse>(
      `/admin/service-workflows/${workflowId}/tasks/lookup/types`
    );
    if (!result.success) {
      throw new Error('Failed to fetch task types');
    }
    return result.data.options;
  }

  static async getTaskDependencies(workflowId: number): Promise<Array<{ value: number; label: string }>> {
    const result = await apiClient.get<WorkflowTaskLookupResponse>(
      `/admin/service-workflows/${workflowId}/tasks/lookup/dependencies`
    );
    if (!result.success) {
      throw new Error('Failed to fetch task dependencies');
    }
    return result.data.options;
  }
}
