import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobTitlesAPI } from '../api/job-titles';
import { JobTitleFilters, CreateJobTitleRequest, UpdateJobTitleRequest } from '../types';
import { useDepartments } from '@/modules/departments/hooks/use-departments';

// Query keys
export const jobTitlesKeys = {
  all: ['job-titles'] as const,
  lists: () => [...jobTitlesKeys.all, 'list'] as const,
  list: (filters: JobTitleFilters) => [...jobTitlesKeys.lists(), filters] as const,
  details: () => [...jobTitlesKeys.all, 'detail'] as const,
  detail: (id: number) => [...jobTitlesKeys.details(), id] as const,
};

// Get all job titles
export const useJobTitles = (filters: JobTitleFilters = {}) => {
  return useQuery({
    queryKey: jobTitlesKeys.list(filters),
    queryFn: () => JobTitlesAPI.getJobTitles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get job title by ID
export const useJobTitle = (id: number) => {
  return useQuery({
    queryKey: jobTitlesKeys.detail(id),
    queryFn: () => JobTitlesAPI.getJobTitleById(id),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry for 404 errors (job title not found)
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Create job title
export const useCreateJobTitle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateJobTitleRequest) => 
      JobTitlesAPI.createJobTitle(data),
    onSuccess: () => {
      // Invalidate and refetch job titles list
      queryClient.invalidateQueries({ queryKey: jobTitlesKeys.lists() });
    },
  });
};

// Update job title
export const useUpdateJobTitle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateJobTitleRequest }) =>
      JobTitlesAPI.updateJobTitle(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific job title and list
      queryClient.invalidateQueries({ queryKey: jobTitlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobTitlesKeys.lists() });
    },
  });
};

// Delete job title
export const useDeleteJobTitle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => JobTitlesAPI.deleteJobTitle(id),
    onSuccess: () => {
      // Invalidate and refetch job titles list
      queryClient.invalidateQueries({ queryKey: jobTitlesKeys.lists() });
    },
  });
};

// Toggle job title status
export const useToggleJobTitleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => JobTitlesAPI.toggleJobTitleStatus(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch specific job title and list
      queryClient.invalidateQueries({ queryKey: jobTitlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobTitlesKeys.lists() });
    },
  });
};

// Departments lookup for dropdowns
export const useDepartmentsLookup = () => {
  const { data: departmentsResponse, ...rest } = useDepartments({ is_active: true });
  
  const departments = departmentsResponse?.data?.departments?.map(dept => ({
    value: dept.id,
    label: dept.name
  })) || [];
  
  return { data: departments, ...rest };
};
