import { apiClient } from '@/lib/api-client';
import {
  EmployeeTasksResponse,
  EmployeeTaskDetailsResponse,
  UpdateTaskStatusRequest,
  UpdateTaskRequest,
  EmployeeTasksFilters,
  CalendarTasksResponse,
  TaskWorkloadResponse,
} from '../types';

export class EmployeeTasksAPI {
  private static baseUrl = '/api/v1/employee/tasks';

  // Get all tasks for the logged-in employee
  static async getEmployeeTasks(filters?: EmployeeTasksFilters): Promise<EmployeeTasksResponse> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.is_overdue !== undefined) params.append('is_overdue', String(filters.is_overdue));
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return await apiClient.get<EmployeeTasksResponse>(url);
  }

  // Get single task details
  static async getTaskById(taskId: number): Promise<EmployeeTaskDetailsResponse> {
    return await apiClient.get<EmployeeTaskDetailsResponse>(`${this.baseUrl}/${taskId}`);
  }

  // Update task status
  static async updateTaskStatus(taskId: number, data: UpdateTaskStatusRequest): Promise<EmployeeTaskDetailsResponse> {
    return await apiClient.patch<EmployeeTaskDetailsResponse>(`${this.baseUrl}/${taskId}/status`, data as unknown as Record<string, unknown>);
  }

  // Get calendar tasks
  static async getCalendarTasks(view: 'month' | 'week' | 'day', date: string): Promise<CalendarTasksResponse> {
    const params = new URLSearchParams();
    params.append('view', view);
    params.append('date', date);
    
    return await apiClient.get<CalendarTasksResponse>(`${this.baseUrl}/calendar?${params.toString()}`);
  }

  // Update task details (notes, feedback, actual_hours)
  static async updateTask(taskId: number, data: UpdateTaskRequest): Promise<EmployeeTaskDetailsResponse> {
    return await apiClient.patch<EmployeeTaskDetailsResponse>(`${this.baseUrl}/${taskId}`, data as unknown as Record<string, unknown>);
  }

  // Start a task
  static async startTask(taskId: number): Promise<EmployeeTaskDetailsResponse> {
    return await apiClient.post<EmployeeTaskDetailsResponse>(`${this.baseUrl}/${taskId}/start`, {});
  }

  // Complete a task
  static async completeTask(taskId: number, data?: { actual_hours?: number; feedback?: string }): Promise<EmployeeTaskDetailsResponse> {
    return await apiClient.post<EmployeeTaskDetailsResponse>(`${this.baseUrl}/${taskId}/complete`, data || {});
  }

  // Put task on hold
  static async holdTask(taskId: number, data?: { reason?: string }): Promise<EmployeeTaskDetailsResponse> {
    return await apiClient.post<EmployeeTaskDetailsResponse>(`${this.baseUrl}/${taskId}/hold`, data || {});
  }

  // Get workload statistics
  static async getWorkload(): Promise<TaskWorkloadResponse> {
    return await apiClient.get<TaskWorkloadResponse>(`${this.baseUrl}/workload`);
  }
}

