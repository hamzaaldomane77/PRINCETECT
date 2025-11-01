import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PdaDocumentsApi } from '../api/pda-documents';
import { CreatePdaDocumentRequest, UpdatePdaDocumentRequest, PdaDocumentFilters } from '../types';

// Query Keys
export const pdaDocumentsQueryKeys = {
  all: ['pda-documents'] as const,
  lists: () => [...pdaDocumentsQueryKeys.all, 'list'] as const,
  list: (filters?: PdaDocumentFilters) => [...pdaDocumentsQueryKeys.lists(), { filters }] as const,
  details: () => [...pdaDocumentsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...pdaDocumentsQueryKeys.details(), id] as const,
  lookups: () => [...pdaDocumentsQueryKeys.all, 'lookup'] as const,
  lookup: (type: string) => [...pdaDocumentsQueryKeys.lookups(), type] as const,
};

// Get all PDA documents
export function usePdaDocuments(filters?: PdaDocumentFilters) {
  return useQuery({
    queryKey: pdaDocumentsQueryKeys.list(filters),
    queryFn: () => PdaDocumentsApi.getPdaDocuments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single PDA document
export function usePdaDocument(id: number) {
  return useQuery({
    queryKey: pdaDocumentsQueryKeys.detail(id),
    queryFn: () => PdaDocumentsApi.getPdaDocument(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create PDA document
export function useCreatePdaDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePdaDocumentRequest) => PdaDocumentsApi.createPdaDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdaDocumentsQueryKeys.lists() });
    },
  });
}

// Update PDA document
export function useUpdatePdaDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePdaDocumentRequest }) =>
      PdaDocumentsApi.updatePdaDocument(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: pdaDocumentsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pdaDocumentsQueryKeys.detail(variables.id) });
    },
  });
}

// Delete PDA document
export function useDeletePdaDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => PdaDocumentsApi.deletePdaDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdaDocumentsQueryKeys.lists() });
    },
  });
}

// Lookup hooks
export function useContractsLookup() {
  return useQuery({
    queryKey: pdaDocumentsQueryKeys.lookup('contracts'),
    queryFn: () => PdaDocumentsApi.getContractsLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCustomersLookup() {
  return useQuery({
    queryKey: pdaDocumentsQueryKeys.lookup('customers'),
    queryFn: () => PdaDocumentsApi.getCustomersLookup(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

