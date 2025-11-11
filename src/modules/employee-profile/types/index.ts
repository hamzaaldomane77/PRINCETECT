// Employee Profile Types

export interface EmployeeProfile {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  work_email: string;
  personal_email: string | null;
  work_mobile: string;
  personal_mobile: string | null;
  office_phone: string | null;
  home_phone: string | null;
  photo: string | null;
  birth_date: string | null;
  gender: string;
  marital_status: string;
  address: string | null;
  department: {
    id: number;
    name: string;
  } | null;
  job_title: {
    id: number;
    name: string;
  } | null;
  city: {
    id: number;
    name: string;
  } | null;
  employee_type: {
    id: number;
    name: string;
  } | null;
  hire_date: string;
  status: string;
  is_manager: boolean;
  is_department_manager: boolean;
}

export interface EmployeeProfileResponse {
  success: boolean;
  data: EmployeeProfile;
  message?: string;
}

export interface UpdateEmployeeProfileRequest {
  first_name?: string;
  last_name?: string;
  work_mobile?: string;
  personal_mobile?: string;
  office_phone?: string;
  home_phone?: string;
  personal_email?: string;
  address?: string;
}

