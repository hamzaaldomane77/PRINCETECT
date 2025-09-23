import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeesAPI } from '../api/employees';
import { EmployeeFilters, CreateEmployeeRequest, UpdateEmployeeApiRequest } from '../types';

// Query keys
export const employeesKeys = {
  all: ['employees'] as const,
  lists: () => [...employeesKeys.all, 'list'] as const,
  list: (filters?: EmployeeFilters) => [...employeesKeys.lists(), filters] as const,
  details: () => [...employeesKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeesKeys.details(), id] as const,
};

// Get all employees
export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: employeesKeys.list(filters),
    queryFn: () => EmployeesAPI.getEmployees(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single employee by ID
export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: employeesKeys.detail(id),
    queryFn: () => EmployeesAPI.getEmployeeById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => EmployeesAPI.createEmployee(data),
    onSuccess: () => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
    },
  });
};

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeApiRequest }) => 
      EmployeesAPI.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch employees list and specific employee
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(id) });
    },
  });
};

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => EmployeesAPI.deleteEmployee(id),
    onSuccess: () => {
      // Invalidate and refetch employees list
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
    },
  });
};

// Toggle employee status
export const useToggleEmployeeStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => EmployeesAPI.toggleEmployeeStatus(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch employees list and specific employee
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(id) });
    },
  });
};

// Get managers lookup for dropdowns
export const useManagersLookup = () => {
  const { data: employeesResponse, ...rest } = useEmployees({ status: 'active' });
  
  // Filter employees who can be managers (you can customize this logic)
  const managers = employeesResponse?.data?.employees?.map(employee => ({
    value: employee.id,
    label: `${employee.first_name} ${employee.last_name}`,
    department: employee.department?.name || 'N/A'
  })) || [];
  
  return { data: managers, ...rest };
};