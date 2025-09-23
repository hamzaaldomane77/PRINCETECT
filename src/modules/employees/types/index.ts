// Employee related types and interfaces

export interface Department {
  id: number;
  name: string;
}

export interface JobTitle {
  id: number;
  name: string;
}

export interface EmployeeType {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export interface Employee {
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
  status: 'active' | 'inactive';
  last_login_at: string | null;
  notes: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  name: string;
  department: Department;
  job_title: JobTitle;
  employee_type: EmployeeType;
  city: City | null;
}

export interface EmployeesResponse {
  success: boolean;
  data: {
    employees: Employee[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeDetailsResponse {
  success: boolean;
  data: Employee;
  message: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  father_name?: string;
  mother_name?: string;
  birth_date?: string;
  gender: 'male' | 'female';
  city_id?: number;
  address?: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
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
  personal_mobile?: string;
  home_phone?: string;
  personal_email?: string;
  business_number?: string;
  office_number?: string;
  phone_number?: string;
  home_number?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  emergency_contact_relationship?: string;
  password: string;
  status?: 'active' | 'inactive';
  notes?: string;
  photo?: File | null;
}

export interface UpdateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  job_title_id?: number;
  department_id?: number;
  hire_date?: string;
  work_email?: string;
  password?: string;
}

export interface UpdateEmployeeApiRequest {
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  job_title_id?: number;
  department_id?: number;
  hire_date?: string;
  work_email?: string;
  password?: string;
}

export interface EmployeeFilters {
  q?: string;
  status?: 'active' | 'inactive';
  department_id?: number;
  job_title_id?: number;
  employee_type_id?: number;
  gender?: 'male' | 'female';
  per_page?: number;
  page?: number;
}
