// Lead Types

// Client interface for the client object in lead details
export interface LeadClient {
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
  preferences: any | null;
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
  lead_id: number;
}

// Meeting interface for meetings array
export interface LeadMeeting {
  id: number;
  lead_id: number;
  client_id: number | null;
  title: string;
  description: string | null;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location: string | null;
  meeting_type: 'in_person' | 'video_call' | 'phone_call' | 'other';
  category: 'internal' | 'external' | 'client' | 'other';
  participants: Record<string, any> | null;
  agenda: string | null;
  type: 'lead' | 'client';
  proposed_dates: string[] | null;
  confirmed_date: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  outcomes: string[] | null;
  action_items: string[] | null;
  next_steps: string[] | null;
  created_by: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: number;
  is_active: boolean;
}

// Quotation interface for quotations array
export interface LeadQuotation {
  id: number;
  lead_id: number;
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
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  sent_date: string | null;
  accepted_date: string | null;
  rejected_date: string | null;
  rejection_reason: string | null;
  notes: string | null;
  terms_conditions: string | null;
  assigned_to: number;
  created_at: string;
  updated_at: string;
  meeting_id: number | null;
  client_id: number | null;
}

// Contract interface for contracts array
export interface LeadContract {
  id: number;
  lead_id: number;
  client_id: number | null;
  contract_number: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  value: string;
  currency: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';
  terms_conditions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: number;
}

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
  client: LeadClient | null;
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
  meetings: LeadMeeting[];
  quotations: LeadQuotation[];
  contracts: LeadContract[];
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
