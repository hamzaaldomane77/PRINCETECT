export interface WorkflowTask {
  id: number;
  workflow_id: number;
  name: string;
  description: string | null;
  task_type: string;
  estimated_duration_hours: number;
  order_sequence: number;
  is_required: boolean;
  dependencies: number | null;
  required_skills: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTasksResponse {
  success: boolean;
  data: {
    tasks: WorkflowTask[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateWorkflowTaskRequest {
  name: string;
  description?: string;
  task_type: string;
  estimated_duration_hours: number;
  order_sequence: number;
  is_required: boolean;
  dependencies?: number[] | null;
  required_skills?: string[] | null;
  notes?: string;
}

export interface UpdateWorkflowTaskRequest {
  name?: string;
  description?: string;
  task_type?: string;
  estimated_duration_hours?: number;
  order_sequence?: number;
  is_required?: boolean;
  dependencies?: number[] | null;
  required_skills?: string[] | null;
  notes?: string;
}

export interface WorkflowTaskLookupResponse {
  success: boolean;
  data: {
    options: Array<{
      value: string | number;
      label: string;
    }>;
  };
  meta: Record<string, unknown>;
}
