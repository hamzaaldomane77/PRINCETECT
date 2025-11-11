// Employee Tasks Types
export interface EmployeeTask {
  id: number;
  name: string;
  description: string;
  task_type: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours: string;
  actual_hours: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  progress_percentage: number;
  is_overdue: boolean;
  notes: string | null;
  feedback: string | null;
  attachments: any[];
  contract: {
    id: number;
    contract_number: string;
    title: string;
  } | null;
  service: {
    id: number;
    name: string;
  } | null;
  client: {
    id: number;
    name: string;
    company_name: string;
  } | null;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface EmployeeTasksResponse {
  success: boolean;
  data: {
    tasks: EmployeeTask[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeTaskDetailsResponse {
  success: boolean;
  data: EmployeeTask;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
  progress_percentage?: number;
  actual_hours?: string;
  notes?: string;
}

export interface UpdateTaskRequest {
  notes?: string;
  feedback?: string;
  actual_hours?: number;
}

export interface TaskWorkloadResponse {
  success: boolean;
  data: {
    percentage: number;
    active_tasks: number;
    overdue_tasks: number;
    total_tasks: number;
  };
}

export interface EmployeeTasksFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  is_overdue?: boolean;
  per_page?: number;
  page?: number;
}

export interface CalendarTasksResponse {
  success: boolean;
  data: {
    view: 'month' | 'week' | 'day';
    date: string;
    start_date: string;
    end_date: string;
    tasks: EmployeeTask[];
    summary: {
      total: number;
      by_status: {
        pending: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        on_hold: number;
      };
      by_priority: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
      };
      overdue_count: number;
    };
  };
}

