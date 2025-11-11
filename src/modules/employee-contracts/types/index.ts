// Employee Contracts Types

export interface EmployeeContract {
  id: number;
  quotation_id: number | null;
  lead_id: number | null;
  contract_number: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  total_value: string;
  total_amount: string;
  advance_payment: string;
  remaining_amount: string;
  currency: string;
  payment_terms: 'upfront' | 'monthly' | 'milestone' | string;
  payment_schedule: string[] | null;
  is_active: boolean;
  status: 'active' | 'completed' | 'cancelled' | 'suspended' | string;
  contract_type: 'service_subscription' | 'one_time_project' | string;
  signed_date: string | null;
  cancelled_date: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  terms_conditions: string | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  client_id: number | null;
  project_manager: {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    employee_id: string;
    photo: string | null;
  } | null;
  quotation: {
    id: number;
    quotation_number: string;
    title: string;
    description: string | null;
    total_amount: string;
    currency: string;
    status: string;
    client_id: number | null;
    lead_id: number | null;
  } | null;
  lead: {
    id: number;
    name: string;
    company_name: string | null;
    email: string;
    phone: string | null;
    mobile: string | null;
  } | null;
  client: {
    id: number;
    name: string;
    company_name: string | null;
    email: string;
    phone: string | null;
    mobile: string | null;
  } | null;
  assigned_employee: {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    employee_id: string;
  } | null;
  contract_services?: ContractService[];
}

export interface ContractService {
  id: number;
  contract_id: number;
  service_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  description: string | null;
  delivery_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service: {
    id: number;
    name: string;
    description: string | null;
    base_price: string;
    currency: string;
    is_active: boolean;
    delivery_time_days: number;
  };
  workflow: {
    id: number;
    contract_service_id: number;
    workflow_id: number;
    status: string;
    start_date: string | null;
    estimated_completion_date: string | null;
    actual_completion_date: string | null;
    assigned_manager_id: number | null;
    notes: string | null;
  } | null;
}

export interface ContractTask {
  id: number;
  contract_service_workflow_id: number;
  workflow_task_id: number;
  assigned_employee_id: number;
  name: string;
  description: string | null;
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  estimated_hours: string;
  actual_hours: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  dependencies_completed: boolean | null;
  attachments: any[] | null;
  notes: string | null;
  feedback: string | null;
  quality_score: number | null;
  created_at: string;
  updated_at: string;
  contract_service_workflow: {
    id: number;
    contract_service_id: number;
    workflow_id: number;
    status: string;
    contract_service: {
      id: number;
      contract_id: number;
      service_id: number;
      service: {
        id: number;
        name: string;
      };
    };
  };
  workflow_task: {
    id: number;
    workflow_id: number;
    name: string;
    description: string | null;
    task_type: string;
    estimated_duration_hours: number;
    order_sequence: number;
    is_required: boolean;
    dependencies: any[] | null;
    required_skills: string[] | null;
    notes: string | null;
  };
  assigned_employee: {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    employee_id: string;
    photo: string | null;
  };
}

export interface EmployeeContractsResponse {
  success: boolean;
  data: {
    contracts: EmployeeContract[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeContractDetailsResponse {
  success: boolean;
  data: EmployeeContract;
  message?: string;
}

export interface ContractServicesResponse {
  success: boolean;
  data: {
    services: ContractService[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ContractTasksResponse {
  success: boolean;
  data: {
    tasks: ContractTask[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ContractServicesFilters {
  q?: string;
  status?: string;
  per_page?: number;
  page?: number;
}

export interface ContractTasksFilters {
  q?: string;
  status?: string;
  priority?: string;
  assigned_employee_id?: number;
  per_page?: number;
  page?: number;
}

export interface EmployeeContractFilters {
  q?: string;
  status?: string;
  contract_type?: string;
  payment_terms?: string;
  currency?: string;
  client_id?: number;
  lead_id?: number;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

