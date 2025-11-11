import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeLeadsAPI } from '../api/employee-leads';
import {
  EmployeeLeadFilters,
  CreateEmployeeLeadRequest,
  UpdateEmployeeLeadRequest,
} from '../types';

// Query keys
export const employeeLeadsQueryKeys = {
  all: ['employee-leads'] as const,
  lists: () => [...employeeLeadsQueryKeys.all, 'list'] as const,
  list: (filters?: EmployeeLeadFilters) => [...employeeLeadsQueryKeys.lists(), filters] as const,
  details: () => [...employeeLeadsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeLeadsQueryKeys.details(), id] as const,
  lookups: () => [...employeeLeadsQueryKeys.all, 'lookup'] as const,
  cities: () => [...employeeLeadsQueryKeys.lookups(), 'cities'] as const,
  statuses: () => [...employeeLeadsQueryKeys.lookups(), 'statuses'] as const,
  priorities: () => [...employeeLeadsQueryKeys.lookups(), 'priorities'] as const,
  employees: () => [...employeeLeadsQueryKeys.lookups(), 'employees'] as const,
  clients: () => [...employeeLeadsQueryKeys.lookups(), 'clients'] as const,
};

// Get all employee leads
export function useEmployeeLeads(filters?: EmployeeLeadFilters) {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.list(filters),
    queryFn: () => EmployeeLeadsAPI.getLeads(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single lead details
export function useEmployeeLead(leadId: number) {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.detail(leadId),
    queryFn: () => EmployeeLeadsAPI.getLeadById(leadId),
    enabled: !!leadId,
    staleTime: 30 * 1000,
  });
}

// Create lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeLeadRequest | FormData) =>
      EmployeeLeadsAPI.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeLeadsQueryKeys.lists() });
    },
  });
}

// Update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: number; data: UpdateEmployeeLeadRequest | FormData }) =>
      EmployeeLeadsAPI.updateLead(leadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeLeadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeLeadsQueryKeys.detail(variables.leadId) });
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: number) => EmployeeLeadsAPI.deleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeLeadsQueryKeys.lists() });
    },
  });
}

// Convert lead to client
export function useConvertLeadToClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId: number) => EmployeeLeadsAPI.convertLeadToClient(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeLeadsQueryKeys.lists() });
    },
  });
}

// Lookup hooks
export function useLeadCities() {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.cities(),
    queryFn: () => EmployeeLeadsAPI.getCities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadStatuses() {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.statuses(),
    queryFn: () => EmployeeLeadsAPI.getStatuses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadPriorities() {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.priorities(),
    queryFn: () => EmployeeLeadsAPI.getPriorities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadEmployees() {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.employees(),
    queryFn: () => EmployeeLeadsAPI.getEmployees(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadClients() {
  return useQuery({
    queryKey: employeeLeadsQueryKeys.clients(),
    queryFn: () => EmployeeLeadsAPI.getClients(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

