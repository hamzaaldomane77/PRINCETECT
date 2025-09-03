import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentsAPI, CreateDepartmentData, UpdateDepartmentData } from '../api/departments';

export function useDepartments(params?: {
  search?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => DepartmentsAPI.getDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => DepartmentsAPI.getDepartment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDepartmentData) => DepartmentsAPI.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentData }) => 
      DepartmentsAPI.updateDepartment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => DepartmentsAPI.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useToggleDepartmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => DepartmentsAPI.toggleDepartmentStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
