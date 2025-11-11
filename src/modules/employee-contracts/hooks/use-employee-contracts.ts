import { useQuery } from '@tanstack/react-query';
import { EmployeeContractsAPI } from '../api/employee-contracts';
import { EmployeeContractFilters, ContractServicesFilters, ContractTasksFilters } from '../types';

// Query keys
export const employeeContractsQueryKeys = {
  all: ['employee-contracts'] as const,
  lists: () => [...employeeContractsQueryKeys.all, 'list'] as const,
  list: (filters?: EmployeeContractFilters) => [...employeeContractsQueryKeys.lists(), filters] as const,
  details: () => [...employeeContractsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeContractsQueryKeys.details(), id] as const,
  services: () => [...employeeContractsQueryKeys.all, 'services'] as const,
  contractServices: (contractId: number, filters?: ContractServicesFilters) => [...employeeContractsQueryKeys.services(), contractId, filters] as const,
  tasks: () => [...employeeContractsQueryKeys.all, 'tasks'] as const,
  contractTasks: (contractId: number, filters?: ContractTasksFilters) => [...employeeContractsQueryKeys.tasks(), contractId, filters] as const,
};

// Get all employee contracts
export function useEmployeeContracts(filters?: EmployeeContractFilters) {
  return useQuery({
    queryKey: employeeContractsQueryKeys.list(filters),
    queryFn: () => EmployeeContractsAPI.getContracts(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get single contract details
export function useEmployeeContract(contractId: number) {
  return useQuery({
    queryKey: employeeContractsQueryKeys.detail(contractId),
    queryFn: () => EmployeeContractsAPI.getContractById(contractId),
    enabled: !!contractId,
    staleTime: 30 * 1000,
  });
}

// Get contract services
export function useContractServices(contractId: number, filters?: ContractServicesFilters) {
  return useQuery({
    queryKey: employeeContractsQueryKeys.contractServices(contractId, filters),
    queryFn: () => EmployeeContractsAPI.getContractServices(contractId, filters),
    enabled: !!contractId,
    staleTime: 30 * 1000,
  });
}

// Get contract tasks
export function useContractTasks(contractId: number, filters?: ContractTasksFilters) {
  return useQuery({
    queryKey: employeeContractsQueryKeys.contractTasks(contractId, filters),
    queryFn: () => EmployeeContractsAPI.getContractTasks(contractId, filters),
    enabled: !!contractId,
    staleTime: 30 * 1000,
  });
}

