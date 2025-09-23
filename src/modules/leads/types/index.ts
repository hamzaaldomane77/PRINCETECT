// Lead Types

export interface Lead {
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
  status: 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'on_hold' | 'converted';
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
  client: any | null;
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
    gender: 'male' | 'female';
    city_id: number | null;
    address: string | null;
    marital_status: 'single' | 'married' | 'divorced' | 'widowed';
    military_status: string | null;
    employee_id: string;
    job_title_id: number;
    department_id: number;
    department_manager_id: number | null;
    hire_date: string;
    team_name: string | null;
    employee_type_id: number;
    job_description: string | null;
    work_mobile: string | null;
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
    status: 'active' | 'inactive';
    last_login_at: string | null;
    notes: string | null;
    photo: string | null;
    created_at: string;
    updated_at: string;
    name: string;
  } | null;
}

export interface LeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateLeadRequest {
  name: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email: string;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string | null;
  registration_number?: string | null;
  alternative_contact?: string | null;
  status: 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'on_hold' | 'converted';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source?: 'website' | 'social_media' | 'referral' | 'cold_call' | 'event' | 'email' | 'other' | null;
  assigned_to?: number | null;
  notes?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  budget?: string | null;
  expected_closing_date?: string | null;
  expected_value?: string | null;
  industry?: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other' | null;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
  annual_revenue?: string | null;
  is_active?: boolean;
  client_id?: number | null;
}

export interface UpdateLeadRequest {
  name?: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string | null;
  registration_number?: string | null;
  alternative_contact?: string | null;
  status?: 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'on_hold' | 'converted';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: 'website' | 'social_media' | 'referral' | 'cold_call' | 'event' | 'email' | 'other' | null;
  assigned_to?: number | null;
  notes?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  budget?: string | null;
  expected_closing_date?: string | null;
  expected_value?: string | null;
  industry?: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other' | null;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
  annual_revenue?: string | null;
  is_active?: boolean;
}

export interface CreateLeadApiRequest {
  name: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email: string;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string | null;
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
}

export interface UpdateLeadApiRequest {
  name?: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string | null;
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
}

export interface LeadFilters {
  status?: string;
  priority?: string;
  source?: string;
  industry?: string;
  size?: string;
  assigned_to?: number;
  city_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}
