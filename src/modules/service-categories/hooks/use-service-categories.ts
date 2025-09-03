import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceCategoriesAPI } from '../api/service-categories';
import { ServiceCategoryFilters, CreateServiceCategoryRequest, UpdateServiceCategoryRequest } from '../types';

// Query keys
export const serviceCategoriesKeys = {
  all: ['service-categories'] as const,
  lists: () => [...serviceCategoriesKeys.all, 'list'] as const,
  list: (filters: ServiceCategoryFilters) => [...serviceCategoriesKeys.lists(), filters] as const,
  details: () => [...serviceCategoriesKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceCategoriesKeys.details(), id] as const,
};

// Get all service categories
export const useServiceCategories = (filters: ServiceCategoryFilters = {}) => {
  return useQuery({
    queryKey: serviceCategoriesKeys.list(filters),
    queryFn: () => ServiceCategoriesAPI.getServiceCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get service category by ID
export const useServiceCategory = (id: number) => {
  return useQuery({
    queryKey: serviceCategoriesKeys.detail(id),
    queryFn: () => ServiceCategoriesAPI.getServiceCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create service category
export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateServiceCategoryRequest) => 
      ServiceCategoriesAPI.createServiceCategory(data),
    onSuccess: () => {
      // Invalidate and refetch service categories list
      queryClient.invalidateQueries({ queryKey: serviceCategoriesKeys.lists() });
    },
  });
};

// Update service category
export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceCategoryRequest }) =>
      ServiceCategoriesAPI.updateServiceCategory(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific category and list
      queryClient.invalidateQueries({ queryKey: serviceCategoriesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceCategoriesKeys.lists() });
    },
  });
};

// Delete service category
export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ServiceCategoriesAPI.deleteServiceCategory(id),
    onSuccess: () => {
      // Invalidate and refetch service categories list
      queryClient.invalidateQueries({ queryKey: serviceCategoriesKeys.lists() });
    },
  });
};

// Toggle service category status
export const useToggleServiceCategoryStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ServiceCategoriesAPI.toggleServiceCategoryStatus(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch specific category and list
      queryClient.invalidateQueries({ queryKey: serviceCategoriesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceCategoriesKeys.lists() });
    },
  });
};
