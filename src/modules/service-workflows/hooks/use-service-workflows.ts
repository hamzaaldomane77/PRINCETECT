import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceWorkflowsAPI } from '../api/service-workflows';
import {
  ServiceWorkflow,
  CreateServiceWorkflowRequest,
  UpdateServiceWorkflowRequest
} from '../types';

export const useServiceWorkflows = (params: {
  q?: string;
  active?: number;
  default?: number;
  service_id?: number;
  per_page?: number;
  page?: number;
} = {}) => {
  return useQuery({
    queryKey: ['service-workflows', params],
    queryFn: () => ServiceWorkflowsAPI.getServiceWorkflows(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useServiceWorkflow = (id: number) => {
  return useQuery({
    queryKey: ['service-workflow', id],
    queryFn: () => ServiceWorkflowsAPI.getServiceWorkflow(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateServiceWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateServiceWorkflowRequest) => ServiceWorkflowsAPI.createServiceWorkflow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-workflows'] });
    },
  });
};

export const useUpdateServiceWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceWorkflowRequest }) => 
      ServiceWorkflowsAPI.updateServiceWorkflow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['service-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['service-workflow', id] });
    },
  });
};

export const useDeleteServiceWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ServiceWorkflowsAPI.deleteServiceWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-workflows'] });
    },
  });
};

export const useToggleServiceWorkflowStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ServiceWorkflowsAPI.toggleServiceWorkflowStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['service-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['service-workflow', id] });
    },
  });
};

export const useServicesLookup = (q: string = '', active: number = 1) => {
  return useQuery({
    queryKey: ['services-lookup', q, active],
    queryFn: () => ServiceWorkflowsAPI.getServicesLookup(q, active),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
