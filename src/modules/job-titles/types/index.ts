// Employee interface for job title details
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  birth_date: string;
  gender: 'male' | 'female';
  city_id: number | null;
  address: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  military_status: string | null;
  employee_id: string;
  job_title_id: number;
  department_id: number;
  department_manager_id: number;
  hire_date: string;
  team_name: string;
  employee_type_id: number;
  job_description: string | null;
  work_mobile: string;
  office_phone: string;
  work_email: string;
  email: string;
  business_number: string | null;
  office_number: string | null;
  phone_number: string | null;
  home_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  emergency_contact_relationship: string | null;
  personal_mobile: string;
  home_phone: string;
  personal_email: string;
  status: 'active' | 'inactive';
  last_login_at: string | null;
  notes: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  name: string;
}

// Job Title Types
export interface JobTitle {
  id: number;
  name: string;
  code: string;
  department_id: number;
  description: string;
  level: 'junior' | 'senior' | 'manager' | 'director';
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  department: {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
    manager_id: number | null;
  };
  employees?: Employee[];
}

export interface JobTitlesResponse {
  success: boolean;
  data: {
    job_titles: JobTitle[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface JobTitleDetailsResponse {
  success: boolean;
  data: JobTitle;
  message: string;
}

export interface CreateJobTitleRequest {
  name: string;
  code: string;
  department_id: number;
  description: string;
  level: 'junior' | 'senior' | 'manager' | 'director';
  is_active?: boolean;
  notes?: string;
}

export interface UpdateJobTitleRequest {
  name?: string;
  code?: string;
  department_id?: number;
  description?: string;
  level?: 'junior' | 'senior' | 'manager' | 'director';
  is_active?: boolean;
  notes?: string;
}

// API Request types (for backend compatibility)
export interface CreateJobTitleApiRequest {
  name: string;
  code: string;
  department_id: number;
  description: string;
  level: 'junior' | 'senior' | 'manager' | 'director';
  is_active?: number; // 1 or 0 for API
  notes?: string;
}

export interface UpdateJobTitleApiRequest {
  name?: string;
  code?: string;
  department_id?: number;
  description?: string;
  level?: 'junior' | 'senior' | 'manager' | 'director';
  is_active?: number; // 1 or 0 for API
  notes?: string;
}

export interface JobTitleFilters {
  q?: string;
  active?: boolean;
  department_id?: number;
  level?: string;
  per_page?: number;
  page?: number;
}
