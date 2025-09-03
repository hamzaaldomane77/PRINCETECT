import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServicesAPI } from '../api/services';
import { ServiceFilters, CreateServiceRequest, UpdateServiceRequest } from '../types';

// Query keys
export const servicesKeys = {
  all: ['services'] as const,
  lists: () => [...servicesKeys.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...servicesKeys.lists(), filters] as const,
  details: () => [...servicesKeys.all, 'detail'] as const,
  detail: (id: number) => [...servicesKeys.details(), id] as const,
};

// Get all services
export const useServices = (filters: ServiceFilters = {}) => {
  return useQuery({
    queryKey: servicesKeys.list(filters),
    queryFn: () => ServicesAPI.getServices(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get service by ID
export const useService = (id: number) => {
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => ServicesAPI.getServiceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => 
      ServicesAPI.createService(data),
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceRequest }) =>
      ServicesAPI.updateService(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific service and list
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ServicesAPI.deleteService(id),
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
};

// Toggle service status
export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ServicesAPI.toggleServiceStatus(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch specific service and list
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
};
