// Contract Types

export interface Contract {
  id: number;
  quotation_id: number | null;
  lead_id: number | null;
  contract_number: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  contract_type: string;
  total_value: string;
  total_amount: string;
  advance_payment: string;
  remaining_amount: string;
  currency: string;
  payment_terms: 'upfront' | 'monthly' | 'milestone';
  payment_schedule: string[] | null;
  is_active: boolean;
  status: 'active' | 'completed' | 'cancelled' | 'suspended';
  signed_date: string | null;
  cancelled_date: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  terms_conditions: string | null;
  assigned_to: number | null;
  project_manager: number | null;
  created_at: string;
  updated_at: string;
  client_id: number | null;
  quotation?: {
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
  lead?: {
    id: number;
    name: string;
    company_name: string | null;
    email: string;
  } | null;
  client?: {
    id: number;
    name: string;
    company_name: string | null;
    email: string;
    phone: string | null;
    mobile: string | null;
  } | null;
  assigned_employee?: {
    id: number;
    name: string;
    employee_id: string;
  } | null;
  contract_services?: any[];
}

export interface ContractsResponse {
  success: boolean;
  data: {
    contracts: Contract[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateContractRequest {
  quotation_id?: number | null;
  lead_id?: number | null;
  client_id?: number | null;
  contract_number: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  contract_type?: string;
  total_value: number;
  total_amount: number;
  advance_payment: number;
  remaining_amount: number;
  currency: string;
  payment_terms: 'upfront' | 'monthly' | 'milestone';
  payment_schedule: string[] | null;
  status: 'active' | 'completed' | 'cancelled' | 'suspended';
  signed_date?: string | null;
  cancelled_date?: string | null;
  cancellation_reason?: string | null;
  notes?: string | null;
  terms_conditions?: string | null;
  assigned_to?: number | null;
  project_manager?: number | null;
  is_active?: boolean | null;
}

export interface UpdateContractRequest {
  quotation_id?: number | null;
  lead_id?: number | null;
  client_id?: number | null;
  contract_number?: string;
  title?: string;
  description?: string | null;
  start_date?: string;
  end_date?: string;
  contract_type?: string;
  total_value?: number;
  total_amount?: number;
  advance_payment?: number;
  remaining_amount?: number;
  currency?: string;
  payment_terms?: 'upfront' | 'monthly' | 'milestone';
  payment_schedule?: string[] | null;
  status?: 'active' | 'completed' | 'cancelled' | 'suspended';
  signed_date?: string | null;
  cancelled_date?: string | null;
  cancellation_reason?: string | null;
  notes?: string | null;
  terms_conditions?: string | null;
  assigned_to?: number | null;
  project_manager?: number | null;
  is_active?: boolean | null;
}

export interface ContractFilters {
  status?: string;
  payment_terms?: string;
  assigned_to?: number;
  client_id?: number;
  lead_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface LookupItem {
  id: number;
  name: string;
  company_name?: string | null;
  email?: string;
  quotation_number?: string;
  title?: string;
  total_amount?: string;
  client_id?: number | null;
  lead_id?: number | null;
  first_name?: string;
  last_name?: string;
  employee_id?: string;
}

export interface LookupResponse {
  success: boolean;
  data: LookupItem[];
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface PaymentTermsOption {
  value: string;
  label: string;
}
