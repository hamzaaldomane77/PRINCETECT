// Lead interface for client relationship
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
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'phone' | 'email' | 'social_media' | 'referral' | 'other';
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
}

// City interface for client location
export interface City {
  id: number;
  name: string;
  code: string;
  country: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Client interface
export interface Client {
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
  industry: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other';
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  annual_revenue: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  payment_terms: string | null;
  credit_limit: string | null;
  is_active: number;
  lead_id: number | null;
  lead?: Lead | null;
  city?: City | null;
}

// API Response Types
export interface ClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ClientDetailsResponse {
  success: boolean;
  data: Client;
  message: string;
}

// Request Types for Creating/Updating Clients
export interface CreateClientRequest {
  lead_id?: number | null;
  name: string;
  email: string;
  password?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company_name?: string | null;
  position?: string | null;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string;
  registration_number?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  industry?: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other';
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  annual_revenue?: number | null;
  is_active?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string | null;
  preferences?: string[];
}

export interface UpdateClientRequest {
  lead_id?: number | null;
  name?: string;
  email?: string;
  password?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company_name?: string | null;
  position?: string | null;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string;
  registration_number?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  industry?: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'services' | 'other';
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  annual_revenue?: number | null;
  is_active?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string | null;
  preferences?: string[];
}

// API Request types (for backend compatibility)
export interface CreateClientApiRequest {
  lead_id?: number | null;
  name: string;
  email: string;
  password?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company_name?: string | null;
  position?: string | null;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string | null;
  registration_number?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  industry?: string;
  size?: string;
  annual_revenue?: number | null;
  is_active?: number; // 1 or 0 for API
  status?: string;
  notes?: string | null;
  preferences?: string[];
}

export interface UpdateClientApiRequest {
  lead_id?: number | null;
  name?: string;
  email?: string;
  password?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company_name?: string | null;
  position?: string | null;
  address?: string | null;
  website?: string | null;
  linkedin?: string | null;
  logo?: string | null;
  registration_number?: string | null;
  city_id?: number | null;
  contact_person?: string | null;
  contact_position?: string | null;
  fax?: string | null;
  industry?: string;
  size?: string;
  annual_revenue?: number | null;
  is_active?: number; // 1 or 0 for API
  status?: string;
  notes?: string | null;
  preferences?: string[];
}

// Filter Types
export interface ClientFilters {
  q?: string;
  active?: boolean;
  status?: string;
  industry?: string;
  size?: string;
  city_id?: number;
  per_page?: number;
  page?: number;
}

// Dropdown/Select Options
export interface IndustryOption {
  value: string;
  label: string;
}

export interface SizeOption {
  value: string;
  label: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

// Constants for dropdowns
export const INDUSTRY_OPTIONS: IndustryOption[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

export const SIZE_OPTIONS: SizeOption[] = [
  { value: 'startup', label: 'Startup' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'enterprise', label: 'Enterprise' },
];

export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];
