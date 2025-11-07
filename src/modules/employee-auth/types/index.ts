// Employee Authentication Types

export interface EmployeeLoginCredentials {
  email: string;
  password: string;
}

export interface EmployeeDepartment {
  id: number;
  name: string;
}

export interface EmployeeJobTitle {
  id: number;
  name: string;
}

export interface EmployeeWorkload {
  percentage: number;
  active_tasks: number;
  overdue_tasks: number;
}

export interface EmployeeUser {
  id: number;
  employee_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo: string | null;
  department: EmployeeDepartment;
  job_title: EmployeeJobTitle;
  is_manager: boolean;
  is_department_manager: boolean;
  permissions: string[];
  roles: string[];
  workload: EmployeeWorkload;
}

export interface EmployeeLoginResponse {
  success: boolean;
  data: {
    token: string;
    token_type: string;
    expires_in: number;
    user: EmployeeUser;
  };
  message: string;
}

export interface EmployeeAuthContextType {
  user: EmployeeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (credentials: EmployeeLoginCredentials) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  isTokenValid: () => boolean;
  hasRole: (role: string) => boolean;
  can: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

