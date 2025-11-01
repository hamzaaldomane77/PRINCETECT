import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadsApi } from '../api/leads';
import { CreateLeadRequest, UpdateLeadRequest, LeadFilters } from '../types';
import { toast } from 'sonner';

// Query Keys
export const leadsQueryKeys = {
  all: ['leads'] as const,
  lists: () => [...leadsQueryKeys.all, 'list'] as const,
  list: (filters?: LeadFilters) => [...leadsQueryKeys.lists(), { filters }] as const,
  details: () => [...leadsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...leadsQueryKeys.details(), id] as const,
};

// Get all leads
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: leadsQueryKeys.list(filters),
    queryFn: () => LeadsApi.getLeads(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single lead
export function useLead(id: number) {
  return useQuery({
    queryKey: leadsQueryKeys.detail(id),
    queryFn: () => LeadsApi.getLead(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create lead
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadRequest | FormData) => LeadsApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating lead:', error);
      toast.error(error?.message || 'Failed to create lead');
    },
  });
}

// Update lead
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeadRequest }) => 
      LeadsApi.updateLead(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(variables.id) });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating lead:', error);
      toast.error(error?.message || 'Failed to update lead');
    },
  });
}

// Delete lead
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => LeadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting lead:', error);
      toast.error(error?.message || 'Failed to delete lead');
    },
  });
}

// Convert lead to client
export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => LeadsApi.convertLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      toast.success('Lead converted to client successfully!');
    },
    onError: (error: any) => {
      console.error('Error converting lead:', error);
      toast.error(error?.response?.data?.message || 'Failed to convert lead to client');
    },
  });
}
