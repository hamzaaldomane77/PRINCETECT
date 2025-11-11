// Employee Clients Types

export interface EmployeeClient {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  mobile: string | null;
  company_name: string | null;
  position: string | null;
  address: string | null;
  website: string | null;
  linkedin: string | null;
  logo: string | null;
  registration_number: string | null;
  status: 'active' | 'inactive' | 'suspended';
  activated_at: string | null;
  suspended_at: string | null;
  notes: string | null;
  preferences: string[] | null;
  created_at: string;
  updated_at: string;
  city_id: number | null;
  contact_person: string | null;
  contact_position: string | null;
  fax: string | null;
  industry: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other' | null;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
  annual_revenue: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  payment_terms: string | null;
  credit_limit: string | null;
  is_active: number;
  lead_id: number | null;
  lead: {
    id: number;
    name: string;
    company_name: string | null;
    position: string | null;
    phone: string | null;
    mobile: string | null;
    email: string;
    address: string | null;
    website: string | null;
    linkedin: string | null;
    logo: string | null;
    registration_number: string | null;
    alternative_contact: string | null;
    status: string;
    priority: string;
    source: string | null;
    assigned_to: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    city_id: number | null;
    contact_person: string | null;
    contact_position: string | null;
    fax: string | null;
    budget: string | null;
    expected_closing_date: string | null;
    expected_value: string | null;
    industry: string | null;
    size: string | null;
    annual_revenue: string | null;
    is_active: number;
    client_id: number | null;
  } | null;
  city: {
    id: number;
    name: string;
    code: string;
    country: string;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  contracts?: any[];
  quotations?: any[];
  meetings?: any[];
}

export interface EmployeeClientsResponse {
  success: boolean;
  data: {
    clients: EmployeeClient[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeClientDetailsResponse {
  success: boolean;
  data: EmployeeClient;
  message?: string;
}

export interface ClientLead {
  id: number;
  name: string;
  company_name: string | null;
  position: string | null;
  phone: string | null;
  mobile: string | null;
  email: string;
  address: string | null;
  website: string | null;
  linkedin: string | null;
  logo: string | null;
  registration_number: string | null;
  alternative_contact: string | null;
  status: string;
  priority: string;
  source: string | null;
  assigned_to: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  city_id: number | null;
  contact_person: string | null;
  contact_position: string | null;
  fax: string | null;
  budget: string | null;
  expected_closing_date: string | null;
  expected_value: string | null;
  industry: string | null;
  size: string | null;
  annual_revenue: string | null;
  is_active: number;
  client_id: number | null;
  city: {
    id: number;
    name: string;
    code: string;
    country: string;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  assigned_employee: {
    id: number;
    first_name: string;
    last_name: string;
    father_name: string | null;
    mother_name: string | null;
    birth_date: string | null;
    gender: string;
    city_id: number;
    address: string | null;
    marital_status: string | null;
    military_status: string | null;
    employee_id: string;
    job_title_id: number;
    department_id: number;
    department_manager_id: number | null;
    hire_date: string;
    team_name: string | null;
    employee_type_id: number;
    job_description: string | null;
    work_mobile: string;
    office_phone: string | null;
    work_email: string;
    email: string;
    business_number: string | null;
    office_number: string | null;
    phone_number: string | null;
    home_number: string | null;
    emergency_contact_name: string | null;
    emergency_contact_number: string | null;
    emergency_contact_relationship: string | null;
    personal_mobile: string | null;
    home_phone: string | null;
    personal_email: string | null;
    status: string;
    last_login_at: string | null;
    notes: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
    name: string;
  } | null;
}

export interface ClientLeadsResponse {
  success: boolean;
  data: {
    leads: ClientLead[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ClientQuotation {
  id: number;
  lead_id: number | null;
  quotation_number: string;
  title: string;
  description: string | null;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  discount_rate: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  valid_until: string | null;
  status: string;
  sent_date: string | null;
  accepted_date: string | null;
  rejected_date: string | null;
  rejection_reason: string | null;
  notes: string | null;
  terms_conditions: string | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  meeting_id: number | null;
  client_id: number | null;
  lead: {
    id: number;
    name: string;
    company_name: string | null;
    position: string | null;
    phone: string | null;
    mobile: string | null;
    email: string;
    address: string | null;
    website: string | null;
    linkedin: string | null;
    logo: string | null;
    registration_number: string | null;
    alternative_contact: string | null;
    status: string;
    priority: string;
    source: string | null;
    assigned_to: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    city_id: number | null;
    contact_person: string | null;
    contact_position: string | null;
    fax: string | null;
    budget: string | null;
    expected_closing_date: string | null;
    expected_value: string | null;
    industry: string | null;
    size: string | null;
    annual_revenue: string | null;
    is_active: number;
    client_id: number | null;
  } | null;
  assigned_employee: {
    id: number;
    first_name: string;
    last_name: string;
    father_name: string | null;
    mother_name: string | null;
    birth_date: string | null;
    gender: string;
    city_id: number;
    address: string | null;
    marital_status: string | null;
    military_status: string | null;
    employee_id: string;
    job_title_id: number;
    department_id: number;
    department_manager_id: number | null;
    hire_date: string;
    team_name: string | null;
    employee_type_id: number;
    job_description: string | null;
    work_mobile: string;
    office_phone: string | null;
    work_email: string;
    email: string;
    business_number: string | null;
    office_number: string | null;
    phone_number: string | null;
    home_number: string | null;
    emergency_contact_name: string | null;
    emergency_contact_number: string | null;
    emergency_contact_relationship: string | null;
    personal_mobile: string | null;
    home_phone: string | null;
    personal_email: string | null;
    status: string;
    last_login_at: string | null;
    notes: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
    name: string;
  } | null;
}

export interface ClientQuotationsResponse {
  success: boolean;
  data: {
    quotations: ClientQuotation[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ClientContract {
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
  payment_terms: string;
  payment_schedule: string[] | null;
  is_active: boolean;
  status: string;
  contract_type: string;
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
}

export interface ClientContractsResponse {
  success: boolean;
  data: {
    contracts: ClientContract[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeClientFilters {
  q?: string;
  status?: string;
  industry?: string;
  size?: string;
  city_id?: number;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

// Lookup Types
export interface LookupCity {
  id: number;
  name: string;
}

export interface LookupStatus {
  value: string;
  label: string;
}

export interface CitiesLookupResponse {
  success: boolean;
  data: LookupCity[];
}

export interface StatusesLookupResponse {
  success: boolean;
  data: LookupStatus[];
}

