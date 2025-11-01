import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QuotationsApi } from '../api/quotations';
import type { CreateQuotationRequest, UpdateQuotationRequest, QuotationFilters } from '../types';

export const quotationsQueryKeys = {
  all: ['quotations'] as const,
  lists: () => [...quotationsQueryKeys.all, 'list'] as const,
  list: (filters: QuotationFilters) => [...quotationsQueryKeys.lists(), filters] as const,
  details: () => [...quotationsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...quotationsQueryKeys.details(), id] as const,
};

export function useQuotations(filters?: QuotationFilters) {
  return useQuery({
    queryKey: quotationsQueryKeys.list(filters || {}),
    queryFn: () => QuotationsApi.getQuotations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useQuotation(id: number) {
  return useQuery({
    queryKey: quotationsQueryKeys.detail(id),
    queryFn: () => QuotationsApi.getQuotation(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationRequest) => QuotationsApi.createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      toast.success('Quotation created successfully!');
    },
    onError: (error: any) => {
      console.error('Error creating quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to create quotation');
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQuotationRequest) => QuotationsApi.updateQuotation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.detail(variables.id) });
      toast.success('Quotation updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to update quotation');
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => QuotationsApi.deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.lists() });
      toast.success('Quotation deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete quotation');
    },
  });
}

// Lookup hooks
export function useLeadsLookup() {
  return useQuery({
    queryKey: ['quotations', 'lookup', 'leads'],
    queryFn: () => QuotationsApi.getLeadsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useClientsLookup() {
  return useQuery({
    queryKey: ['quotations', 'lookup', 'clients'],
    queryFn: () => QuotationsApi.getClientsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useEmployeesLookup() {
  return useQuery({
    queryKey: ['quotations', 'lookup', 'employees'],
    queryFn: () => QuotationsApi.getEmployeesLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCurrenciesLookup() {
  return useQuery({
    queryKey: ['quotations', 'lookup', 'currencies'],
    queryFn: () => QuotationsApi.getCurrenciesLookup(),
    staleTime: 30 * 60 * 1000, // 30 minutes - currencies don't change often
  });
}

export function useStatusesLookup() {
  return useQuery({
    queryKey: ['quotations', 'lookup', 'statuses'],
    queryFn: () => QuotationsApi.getStatusesLookup(),
    staleTime: 30 * 60 * 1000, // 30 minutes - statuses don't change often
  });
}

export function useServicesLookup() {
  return useQuery({
    queryKey: ['quotations', 'lookup', 'services'],
    queryFn: () => QuotationsApi.getServicesLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Quotation Services hooks
export function useQuotationServices(quotationId: number) {
  return useQuery({
    queryKey: ['quotations', 'services', quotationId],
    queryFn: () => QuotationsApi.getQuotationServices(quotationId),
    enabled: !!quotationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddQuotationService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: number; data: { service_id: number; quantity: number; unit_price: number; description?: string; notes?: string } }) => 
      QuotationsApi.addQuotationService(quotationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations', 'services', variables.quotationId] });
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.detail(variables.quotationId) });
      toast.success('Service added successfully!');
    },
    onError: (error: any) => {
      console.error('Error adding service:', error);
      toast.error(error?.response?.data?.message || 'Failed to add service');
    },
  });
}

// Quotation Actions hooks
export function useSendQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quotationId: number) => QuotationsApi.sendQuotation(quotationId),
    onSuccess: (_, quotationId) => {
      // Invalidate both detail and list queries in one go
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.detail(quotationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.lists() 
      });
      toast.success('Quotation sent successfully!');
    },
    onError: (error: any) => {
      console.error('Error sending quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to send quotation');
    },
  });
}

export function useAcceptQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: number; data: { notes?: string } }) => 
      QuotationsApi.acceptQuotation(quotationId, data),
    onSuccess: (_, variables) => {
      // Invalidate both detail and list queries in one go
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.detail(variables.quotationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.lists() 
      });
      toast.success('Quotation accepted successfully!');
    },
    onError: (error: any) => {
      console.error('Error accepting quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to accept quotation');
    },
  });
}

export function useRejectQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: number; data: { rejection_reason: string } }) => 
      QuotationsApi.rejectQuotation(quotationId, data),
    onSuccess: (_, variables) => {
      // Invalidate both detail and list queries in one go
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.detail(variables.quotationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.lists() 
      });
      toast.success('Quotation rejected successfully!');
    },
    onError: (error: any) => {
      console.error('Error rejecting quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject quotation');
    },
  });
}

export function useModifyQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: number; data: { notes?: string } }) => 
      QuotationsApi.modifyQuotation(quotationId, data),
    onSuccess: (_, variables) => {
      // Invalidate both detail and list queries in one go
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.detail(variables.quotationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: quotationsQueryKeys.lists() 
      });
      toast.success('Quotation modification request sent successfully!');
    },
    onError: (error: any) => {
      console.error('Error modifying quotation:', error);
      toast.error(error?.response?.data?.message || 'Failed to modify quotation');
    },
  });
}

// Quotation Service Management hooks
export function useUpdateQuotationService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, serviceId, data }: { quotationId: number; serviceId: number; data: { quantity: number; unit_price: number; description?: string; notes?: string } }) => 
      QuotationsApi.updateQuotationService(quotationId, serviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.detail(variables.quotationId) });
      queryClient.invalidateQueries({ queryKey: ['quotations', 'services', variables.quotationId] });
      toast.success('Service updated successfully!');
    },
    onError: (error: any) => {
      console.error('Error updating service:', error);
      toast.error(error?.response?.data?.message || 'Failed to update service');
    },
  });
}

export function useDeleteQuotationService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quotationId, serviceId }: { quotationId: number; serviceId: number }) => 
      QuotationsApi.deleteQuotationService(quotationId, serviceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationsQueryKeys.detail(variables.quotationId) });
      queryClient.invalidateQueries({ queryKey: ['quotations', 'services', variables.quotationId] });
      toast.success('Service deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Error deleting service:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete service');
    },
  });
}