// Employee Quotations Types

export interface EmployeeQuotation {
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'modified';
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
  client: {
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
    status: string;
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
    industry: string | null;
    size: string | null;
    annual_revenue: string | null;
    contract_start_date: string | null;
    contract_end_date: string | null;
    payment_terms: string | null;
    credit_limit: string | null;
    is_active: number;
    lead_id: number | null;
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
  quotation_services?: QuotationService[];
}

export interface QuotationService {
  id: number;
  quotation_id: number;
  service_id: number;
  service_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  service?: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface EmployeeQuotationsResponse {
  success: boolean;
  data: {
    quotations: EmployeeQuotation[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeQuotationDetailsResponse {
  success: boolean;
  data: EmployeeQuotation;
  message?: string;
}

export interface QuotationServicesResponse {
  success: boolean;
  data: {
    services: QuotationService[];
  };
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeQuotationFilters {
  q?: string;
  status?: string;
  lead_id?: number;
  client_id?: number;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

// Lookup Types
export interface LookupClient {
  id: number;
  name: string;
  company_name: string | null;
  email: string;
}

export interface LookupLead {
  id: number;
  name: string;
  company_name: string | null;
  email: string;
}

export interface LookupStatus {
  value: string;
  label: string;
}

export interface LookupCurrency {
  value: string;
  label: string;
}

export interface ClientsLookupResponse {
  success: boolean;
  data: LookupClient[];
}

export interface LeadsLookupResponse {
  success: boolean;
  data: LookupLead[];
}

export interface StatusesLookupResponse {
  success: boolean;
  data: LookupStatus[];
}

export interface CurrenciesLookupResponse {
  success: boolean;
  data: LookupCurrency[];
}

