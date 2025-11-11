import { useQuery } from '@tanstack/react-query';
import { EmployeeClientsAPI } from '../api/employee-clients';
import { EmployeeClientFilters } from '../types';

// Query keys
export const employeeClientsQueryKeys = {
  all: ['employee-clients'] as const,
  lists: () => [...employeeClientsQueryKeys.all, 'list'] as const,
  list: (filters?: EmployeeClientFilters) => [...employeeClientsQueryKeys.lists(), filters] as const,
  details: () => [...employeeClientsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeClientsQueryKeys.details(), id] as const,
  leads: () => [...employeeClientsQueryKeys.all, 'leads'] as const,
  clientLeads: (clientId: number, page?: number, perPage?: number) => [...employeeClientsQueryKeys.leads(), clientId, page, perPage] as const,
  quotations: () => [...employeeClientsQueryKeys.all, 'quotations'] as const,
  clientQuotations: (clientId: number, page?: number, perPage?: number) => [...employeeClientsQueryKeys.quotations(), clientId, page, perPage] as const,
  contracts: () => [...employeeClientsQueryKeys.all, 'contracts'] as const,
  clientContracts: (clientId: number, page?: number, perPage?: number) => [...employeeClientsQueryKeys.contracts(), clientId, page, perPage] as const,
  lookups: () => [...employeeClientsQueryKeys.all, 'lookup'] as const,
  cities: () => [...employeeClientsQueryKeys.lookups(), 'cities'] as const,
  statuses: () => [...employeeClientsQueryKeys.lookups(), 'statuses'] as const,
};

// Get all employee clients
export function useEmployeeClients(filters?: EmployeeClientFilters) {
  return useQuery({
    queryKey: employeeClientsQueryKeys.list(filters),
    queryFn: () => EmployeeClientsAPI.getClients(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single client details
export function useEmployeeClient(clientId: number) {
  return useQuery({
    queryKey: employeeClientsQueryKeys.detail(clientId),
    queryFn: () => EmployeeClientsAPI.getClientById(clientId),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
}

// Get client leads
export function useClientLeads(clientId: number, page?: number, perPage?: number) {
  return useQuery({
    queryKey: employeeClientsQueryKeys.clientLeads(clientId, page, perPage),
    queryFn: () => EmployeeClientsAPI.getClientLeads(clientId, page, perPage),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
}

// Get client quotations
export function useClientQuotations(clientId: number, page?: number, perPage?: number) {
  return useQuery({
    queryKey: employeeClientsQueryKeys.clientQuotations(clientId, page, perPage),
    queryFn: () => EmployeeClientsAPI.getClientQuotations(clientId, page, perPage),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
}

// Get client contracts
export function useClientContracts(clientId: number, page?: number, perPage?: number) {
  return useQuery({
    queryKey: employeeClientsQueryKeys.clientContracts(clientId, page, perPage),
    queryFn: () => EmployeeClientsAPI.getClientContracts(clientId, page, perPage),
    enabled: !!clientId,
    staleTime: 30 * 1000,
  });
}

// Lookup hooks
export function useClientCities() {
  return useQuery({
    queryKey: employeeClientsQueryKeys.cities(),
    queryFn: () => EmployeeClientsAPI.getCities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClientStatuses() {
  return useQuery({
    queryKey: employeeClientsQueryKeys.statuses(),
    queryFn: () => EmployeeClientsAPI.getStatuses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

