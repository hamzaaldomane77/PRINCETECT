import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientsAPI } from '../api/clients';
import { ClientFilters, CreateClientRequest, UpdateClientRequest } from '../types';
import { useCities } from '@/modules/cities/hooks/use-cities';

// Query keys
export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientsKeys.details(), id] as const,
};

// Get all clients
export const useClients = (filters: ClientFilters = {}) => {
  return useQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: () => ClientsAPI.getClients(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get client by ID
export const useClient = (id: number) => {
  return useQuery({
    queryKey: clientsKeys.detail(id),
    queryFn: () => ClientsAPI.getClientById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404 errors (client not found)
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Create client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClientRequest) => 
      ClientsAPI.createClient(data),
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
};

// Update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientRequest }) =>
      ClientsAPI.updateClient(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific client and list
      queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
};

// Delete client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ClientsAPI.deleteClient(id),
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
};

// Toggle client status
export const useToggleClientStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ClientsAPI.toggleClientStatus(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch specific client and list
      queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
};

// Activate client
export const useActivateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ClientsAPI.activateClient(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch specific client and list
      queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
};

// Suspend client
export const useSuspendClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      ClientsAPI.suspendClient(id, reason),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific client and list
      queryClient.invalidateQueries({ queryKey: clientsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
};

// Cities lookup for dropdowns
export const useCitiesLookup = () => {
  const { data: citiesResponse, ...rest } = useCities({ is_active: true });
  
  const cities = citiesResponse?.data?.cities?.map(city => ({
    value: city.id,
    label: city.name
  })) || [];
  
  return { data: cities, ...rest };
};
