import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingsApi } from '../api/meetings';
import { CreateMeetingRequest, UpdateMeetingRequest } from '../types';

// Query keys
export const meetingKeys = {
  all: ['meetings'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...meetingKeys.lists(), { filters }] as const,
  details: () => [...meetingKeys.all, 'detail'] as const,
  detail: (id: number) => [...meetingKeys.details(), id] as const,
};

// Get all meetings
export const useMeetings = () => {
  return useQuery({
    queryKey: meetingKeys.lists(),
    queryFn: meetingsApi.getMeetings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get meeting by ID
export const useMeeting = (id: number) => {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => meetingsApi.getMeeting(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create meeting mutation
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingRequest) => meetingsApi.createMeeting(data),
    onSuccess: () => {
      // Invalidate and refetch meetings list
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
};

// Update meeting mutation
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMeetingRequest) => meetingsApi.updateMeeting(data),
    onSuccess: (response, variables) => {
      // Invalidate meetings list and specific meeting detail
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(variables.id) });
    },
  });
};

// Delete meeting mutation
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => meetingsApi.deleteMeeting(id),
    onSuccess: () => {
      // Invalidate and refetch meetings list
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
};
