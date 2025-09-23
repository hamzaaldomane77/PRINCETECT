// Employee Types related types and interfaces

export interface EmployeeType {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTypesResponse {
  success: boolean;
  data: {
    employee_types: EmployeeType[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeTypeDetailsResponse {
  success: boolean;
  data: EmployeeType;
  message: string;
}

export interface CreateEmployeeTypeRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateEmployeeTypeRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  notes?: string;
}

// API Request types (for backend compatibility)
export interface CreateEmployeeTypeApiRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: number; // 1 or 0 for API
  notes?: string;
}

export interface UpdateEmployeeTypeApiRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: number; // 1 or 0 for API
  notes?: string;
}

export interface EmployeeTypeFilters {
  q?: string;
  active?: boolean;
  per_page?: number;
  page?: number;
}
