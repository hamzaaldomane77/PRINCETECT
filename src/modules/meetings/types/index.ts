
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  father_name?: string;
  mother_name?: string;
  birth_date?: string;
  gender: 'male' | 'female';
  city_id?: number;
  address?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  military_status?: string;
  employee_id: string;
  job_title_id: number;
  department_id: number;
  department_manager_id?: number;
  hire_date: string;
  team_name?: string;
  employee_type_id: number;
  job_description?: string;
  work_mobile: string;
  office_phone?: string;
  work_email: string;
  email: string;
  business_number?: string;
  office_number?: string;
  phone_number?: string;
  home_number?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  emergency_contact_relationship?: string;
  personal_mobile?: string;
  home_phone?: string;
  personal_email?: string;
  status: 'active' | 'inactive';
  last_login_at?: string;
  notes?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface Lead {
  id: number;
  name: string;
  company_name: string;
  position?: string;
  phone: string;
  mobile?: string;
  email: string;
  address?: string;
  website?: string;
  linkedin?: string;
  logo?: string;
  registration_number?: string;
  alternative_contact?: string;
  status: 'new' | 'qualified' | 'converted' | 'negotiation' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'website' | 'referral' | 'cold_call' | 'event' | 'other';
  assigned_to: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  city_id?: number;
  contact_person?: string;
  contact_position?: string;
  fax?: string;
  budget?: string;
  expected_closing_date?: string;
  expected_value?: string;
  industry?: string;
  size?: string;
  annual_revenue?: string;
  is_active: number;
  client_id?: number;
}

export interface Client {
  id: number;
  name: string;
  company_name: string;
  position?: string;
  phone: string;
  mobile?: string;
  email: string;
  address?: string;
  website?: string;
  linkedin?: string;
  logo?: string;
  registration_number?: string;
  alternative_contact?: string;
  status: 'active' | 'inactive' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'website' | 'referral' | 'cold_call' | 'event' | 'other';
  assigned_to: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  city_id?: number;
  contact_person?: string;
  contact_position?: string;
  fax?: string;
  budget?: string;
  expected_closing_date?: string;
  expected_value?: string;
  industry?: string;
  size?: string;
  annual_revenue?: string;
  is_active: number;
  client_id?: number;
}

export interface Meeting {
  id: number;
  lead_id?: number;
  client_id?: number;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location: string;
  meeting_type: 'in_person' | 'video_call' | 'phone_call';
  category: 'lead' | 'client' | 'internal' | 'management';
  participants?: Record<string, string> | null;
  agenda?: string | null;
  type: 'lead' | 'client' | 'internal';
  proposed_dates?: string[] | null;
  confirmed_date?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  outcomes?: string[] | null;
  action_items?: string[] | null;
  next_steps?: string[] | null;
  created_by: Employee | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: number;
  is_active: boolean;
  lead?: Lead | null;
  client?: Client | null;
  assigned_employee?: Employee | null;
}

export interface MeetingsResponse {
  success: boolean;
  data: {
    meetings: Meeting[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface MeetingResponse {
  success: boolean;
  data: {
    meeting?: Meeting;
    meetings?: Meeting[];
    attachments?: any[];
  };
  message?: string;
}

export interface CreateMeetingRequest {
  lead_id?: number;
  client_id?: number;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location: string;
  meeting_type: 'in_person' | 'video_call' | 'phone_call';
  category: 'lead' | 'client' | 'internal' | 'management';
  participants?: Record<string, string>;
  agenda?: string;
  type: 'lead' | 'client' | 'internal';
  proposed_dates?: string[];
  confirmed_date?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  outcomes?: string[];
  action_items?: string[];
  next_steps?: string[];
  notes?: string;
  assigned_to: number;
}

export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  id: number;
}
