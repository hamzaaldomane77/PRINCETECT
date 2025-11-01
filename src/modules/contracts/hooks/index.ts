import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContractsApi } from '../api/contracts';
import { CreateContractRequest, UpdateContractRequest, ContractFilters } from '../types';
import { toast } from 'sonner';

// Query Keys
export const contractsQueryKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractsQueryKeys.all, 'list'] as const,
  list: (filters?: ContractFilters) => [...contractsQueryKeys.lists(), { filters }] as const,
  details: () => [...contractsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...contractsQueryKeys.details(), id] as const,
  lookups: () => [...contractsQueryKeys.all, 'lookup'] as const,
  lookup: (type: string) => [...contractsQueryKeys.lookups(), type] as const,
};

// Get all contracts
export function useContracts(filters?: ContractFilters) {
  return useQuery({
    queryKey: contractsQueryKeys.list(filters),
    queryFn: () => ContractsApi.getContracts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single contract
export function useContract(id: number) {
  return useQuery({
    queryKey: contractsQueryKeys.detail(id),
    queryFn: () => ContractsApi.getContract(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractRequest) => ContractsApi.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      toast.success('Contract created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating contract:', error);
      toast.error(error?.response?.data?.message || 'Failed to create contract');
    },
  });
}

// Update contract
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateContractRequest }) => 
      ContractsApi.updateContract(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.detail(variables.id) });
      toast.success('Contract updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating contract:', error);
      toast.error(error?.response?.data?.message || 'Failed to update contract');
    },
  });
}

// Delete contract
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ContractsApi.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.lists() });
      toast.success('Contract deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting contract:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete contract');
    },
  });
}

// Lookup hooks
export function useLeadsLookup() {
  return useQuery({
    queryKey: contractsQueryKeys.lookup('leads'),
    queryFn: () => ContractsApi.getLeadsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useClientsLookup() {
  return useQuery({
    queryKey: contractsQueryKeys.lookup('clients'),
    queryFn: () => ContractsApi.getClientsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useQuotationsLookup() {
  return useQuery({
    queryKey: contractsQueryKeys.lookup('quotations'),
    queryFn: () => ContractsApi.getQuotationsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useEmployeesLookup() {
  return useQuery({
    queryKey: contractsQueryKeys.lookup('employees'),
    queryFn: () => ContractsApi.getEmployeesLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useStatusesLookup() {
  return useQuery({
    queryKey: contractsQueryKeys.lookup('statuses'),
    queryFn: () => ContractsApi.getStatusesLookup(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function usePaymentTermsLookup() {
  return useQuery({
    queryKey: contractsQueryKeys.lookup('payment-terms'),
    queryFn: () => ContractsApi.getPaymentTermsLookup(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Contract Services Hooks
export function useAddContractService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { 
      contractId: number; 
      data: { service_id: number; quantity: number; unit_price: number; delivery_date: string; description?: string; notes?: string } 
    }) => ContractsApi.addContractService(contractId, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.detail(contractId) });
      toast.success('Service added to contract successfully');
    },
    onError: (error: any) => {
      console.error('Error adding service to contract:', error);
      toast.error(error?.response?.data?.message || 'Failed to add service to contract');
    },
  });
}

export function useUpdateContractService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, serviceId, data }: { 
      contractId: number; 
      serviceId: number; 
      data: { service_id?: number; quantity?: number; unit_price?: number; delivery_date?: string; description?: string; notes?: string } 
    }) => ContractsApi.updateContractService(contractId, serviceId, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.detail(contractId) });
      toast.success('Contract service updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating contract service:', error);
      toast.error(error?.response?.data?.message || 'Failed to update contract service');
    },
  });
}

export function useDeleteContractService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, serviceId }: { contractId: number; serviceId: number }) => 
      ContractsApi.deleteContractService(contractId, serviceId),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: contractsQueryKeys.detail(contractId) });
      toast.success('Service removed from contract successfully');
    },
    onError: (error: any) => {
      console.error('Error removing service from contract:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove service from contract');
    },
  });
}