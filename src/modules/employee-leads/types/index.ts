// Employee Leads Types

export interface EmployeeLead {
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
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'on_hold' | 'converted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'website' | 'social_media' | 'referral' | 'cold_call' | 'event' | 'email' | 'other' | null;
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
  industry: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other' | null;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
  annual_revenue: string | null;
  is_active: number;
  client_id: number | null;
  client: {
    id: number;
    email: string;
    name: string;
    phone: string;
    mobile: string;
    company_name: string;
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
    preferences: any | null;
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
    lead_id: number;
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
  assigned_employee: {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    employee_id: string;
    email: string;
  } | null;
  meetings: any[];
  quotations: any[];
  contracts: any[];
}

export interface EmployeeLeadsResponse {
  success: boolean;
  data: {
    leads: EmployeeLead[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeLeadDetailsResponse {
  success: boolean;
  data: EmployeeLead;
  message: string;
}

export interface EmployeeLeadFilters {
  q?: string;
  status?: string;
  priority?: string;
  city_id?: number;
  source?: string;
  industry?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export interface CreateEmployeeLeadRequest {
  name: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email: string;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: File | null;
  registration_number?: string | null;
  alternative_contact?: string | null;
  status: string;
  priority: string;
  source?: string | null;
  assigned_to?: number | null;
  notes?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  budget?: string | null;
  expected_closing_date?: string | null;
  expected_value?: string | null;
  industry?: string | null;
  size?: string | null;
  annual_revenue?: string | null;
  is_active?: number;
  client_id?: number | null;
}

export interface UpdateEmployeeLeadRequest {
  name?: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: File | null;
  registration_number?: string | null;
  alternative_contact?: string | null;
  status?: string;
  priority?: string;
  source?: string | null;
  assigned_to?: number | null;
  notes?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  budget?: string | null;
  expected_closing_date?: string | null;
  expected_value?: string | null;
  industry?: string | null;
  size?: string | null;
  annual_revenue?: string | null;
  is_active?: number;
  client_id?: number | null;
}

// Lookup types
export interface LookupOption {
  id?: number;
  value?: string;
  label: string;
  name?: string;
  email?: string;
  company_name?: string;
}

export interface LookupResponse {
  success: boolean;
  data: LookupOption[];
}

// Convert lead to client response
export interface ConvertLeadToClientResponse {
  success: boolean;
  data: {
    client: {
      lead_id: number;
      name: string;
      email: string;
      phone: string | null;
      mobile: string | null;
      company_name: string | null;
      position: string | null;
      address: string | null;
      website: string | null;
      linkedin: string | null;
      logo: string | null;
      registration_number: string | null;
      city_id: number | null;
      contact_person: string | null;
    };
  };
}

