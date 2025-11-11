export interface Task {
  id: number;
  name: string;
  description: string | null;
  task_type: string;
  status: string;
  priority: string;
  estimated_hours: string;
  actual_hours: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  progress_percentage: number;
  is_overdue: boolean;
  notes: string | null;
  feedback: string | null;
  assigned_employee: number | { id: number; full_name?: string; name?: string } | null;
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
    company_name: string | null;
  } | null;
  workflow_task: {
    id: number;
    name: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface TaskDetailsResponse {
  success: boolean;
  data: {
    task: Task;
  };
}

export interface CreateTaskRequest {
  name: string;
  description?: string | null;
  task_type: string;
  status?: string;
  priority?: string;
  estimated_hours?: number;
  actual_hours?: number | null;
  start_date?: string | null;
  due_date?: string | null;
  completed_date?: string | null;
  progress_percentage?: number;
  notes?: string | null;
  feedback?: string | null;
  assigned_employee?: number | null;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string | null;
  task_type?: string;
  status?: string;
  priority?: string;
  estimated_hours?: number;
  actual_hours?: number | null;
  start_date?: string | null;
  due_date?: string | null;
  completed_date?: string | null;
  progress_percentage?: number;
  notes?: string | null;
  feedback?: string | null;
  assigned_employee?: number | null;
}

export interface TaskLookupResponse {
  success: boolean;
  data: {
    options: Array<{
      value: number;
      label: string;
    }>;
  };
}

export interface AssignTaskRequest {
  assigned_employee_id: number;
  due_date?: string | null;
  priority?: string;
  notes?: string | null;
}

export interface BulkAssignTasksRequest {
  task_ids: number[];
  assigned_employee_id: number;
  due_date?: string | null;
  priority?: string;
}

