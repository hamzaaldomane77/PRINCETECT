import { useQuery } from '@tanstack/react-query';
import { EmployeeQuotationsAPI } from '../api/employee-quotations';
import { EmployeeQuotationFilters } from '../types';

// Query keys
export const employeeQuotationsQueryKeys = {
  all: ['employee-quotations'] as const,
  lists: () => [...employeeQuotationsQueryKeys.all, 'list'] as const,
  list: (filters?: EmployeeQuotationFilters) => [...employeeQuotationsQueryKeys.lists(), filters] as const,
  details: () => [...employeeQuotationsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeQuotationsQueryKeys.details(), id] as const,
  services: () => [...employeeQuotationsQueryKeys.all, 'services'] as const,
  quotationServices: (quotationId: number, page?: number, perPage?: number) => [...employeeQuotationsQueryKeys.services(), quotationId, page, perPage] as const,
  lookups: () => [...employeeQuotationsQueryKeys.all, 'lookup'] as const,
  clients: () => [...employeeQuotationsQueryKeys.lookups(), 'clients'] as const,
  leads: () => [...employeeQuotationsQueryKeys.lookups(), 'leads'] as const,
  statuses: () => [...employeeQuotationsQueryKeys.lookups(), 'statuses'] as const,
  currencies: () => [...employeeQuotationsQueryKeys.lookups(), 'currencies'] as const,
};

// Get all employee quotations
export function useEmployeeQuotations(filters?: EmployeeQuotationFilters) {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.list(filters),
    queryFn: () => EmployeeQuotationsAPI.getQuotations(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single quotation details
export function useEmployeeQuotation(quotationId: number) {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.detail(quotationId),
    queryFn: () => EmployeeQuotationsAPI.getQuotationById(quotationId),
    enabled: !!quotationId,
    staleTime: 30 * 1000,
  });
}

// Get quotation services
export function useQuotationServices(quotationId: number, page?: number, perPage?: number) {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.quotationServices(quotationId, page, perPage),
    queryFn: () => EmployeeQuotationsAPI.getQuotationServices(quotationId, page, perPage),
    enabled: !!quotationId,
    staleTime: 30 * 1000,
  });
}

// Lookup hooks
export function useQuotationClients() {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.clients(),
    queryFn: () => EmployeeQuotationsAPI.getClients(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuotationLeads() {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.leads(),
    queryFn: () => EmployeeQuotationsAPI.getLeads(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuotationStatuses() {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.statuses(),
    queryFn: () => EmployeeQuotationsAPI.getStatuses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuotationCurrencies() {
  return useQuery({
    queryKey: employeeQuotationsQueryKeys.currencies(),
    queryFn: () => EmployeeQuotationsAPI.getCurrencies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

