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

export interface ServiceWorkflow {
  id: number;
  service_id: number;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
  estimated_duration_days: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tasks_count: number;
  service: {
    id: number;
    name: string;
  };
  tasks?: WorkflowTask[];
}

export interface ServiceWorkflowsResponse {
  success: boolean;
  data: {
    workflows: ServiceWorkflow[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateServiceWorkflowRequest {
  service_id: number;
  name: string;
  description?: string;
  is_default?: boolean;
  is_active: boolean;
  estimated_duration_days?: number;
  notes?: string;
}

export interface UpdateServiceWorkflowRequest {
  name?: string;
  description?: string;
  is_default?: boolean;
  is_active?: boolean;
  estimated_duration_days?: number;
  notes?: string;
}

export interface ServiceWorkflowLookupResponse {
  success: boolean;
  data: {
    options: Array<{
      value: number;
      label: string;
    }>;
  };
  meta: Record<string, unknown>;
}
