import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeTypesAPI } from '../api/employee-types';
import { EmployeeTypeFilters, CreateEmployeeTypeRequest, UpdateEmployeeTypeRequest } from '../types';

// Query keys
export const employeeTypesKeys = {
  all: ['employee-types'] as const,
  lists: () => [...employeeTypesKeys.all, 'list'] as const,
  list: (filters: EmployeeTypeFilters) => [...employeeTypesKeys.lists(), filters] as const,
  details: () => [...employeeTypesKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeTypesKeys.details(), id] as const,
};

// Get all employee types
export const useEmployeeTypes = (filters: EmployeeTypeFilters = {}) => {
  return useQuery({
    queryKey: employeeTypesKeys.list(filters),
    queryFn: () => EmployeeTypesAPI.getEmployeeTypes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get employee type by ID
export const useEmployeeType = (id: number) => {
  return useQuery({
    queryKey: employeeTypesKeys.detail(id),
    queryFn: () => EmployeeTypesAPI.getEmployeeTypeById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404 errors (employee type not found)
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Create employee type
export const useCreateEmployeeType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEmployeeTypeRequest) => 
      EmployeeTypesAPI.createEmployeeType(data),
    onSuccess: () => {
      // Invalidate and refetch employee types list
      queryClient.invalidateQueries({ queryKey: employeeTypesKeys.lists() });
    },
  });
};

// Update employee type
export const useUpdateEmployeeType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeTypeRequest }) =>
      EmployeeTypesAPI.updateEmployeeType(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific employee type and list
      queryClient.invalidateQueries({ queryKey: employeeTypesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeTypesKeys.lists() });
    },
  });
};

// Delete employee type
export const useDeleteEmployeeType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => EmployeeTypesAPI.deleteEmployeeType(id),
    onSuccess: () => {
      // Invalidate and refetch employee types list
      queryClient.invalidateQueries({ queryKey: employeeTypesKeys.lists() });
    },
  });
};

// Toggle employee type status
export const useToggleEmployeeTypeStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => EmployeeTypesAPI.toggleEmployeeTypeStatus(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch specific employee type and list
      queryClient.invalidateQueries({ queryKey: employeeTypesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeTypesKeys.lists() });
    },
  });
};
