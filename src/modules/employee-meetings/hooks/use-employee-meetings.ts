import { useQuery } from '@tanstack/react-query';
import { employeeMeetingsApi } from '../api/employee-meetings';

export const employeeMeetingsQueryKeys = {
  all: ['employee-meetings'] as const,
  lists: () => [...employeeMeetingsQueryKeys.all, 'list'] as const,
  list: (params?: { per_page?: number; page?: number }) => 
    [...employeeMeetingsQueryKeys.lists(), params] as const,
  upcoming: (params?: { per_page?: number; page?: number }) => 
    [...employeeMeetingsQueryKeys.all, 'upcoming', params] as const,
  details: () => [...employeeMeetingsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeMeetingsQueryKeys.details(), id] as const,
};

export function useEmployeeMeetings(params?: { per_page?: number; page?: number }) {
  return useQuery({
    queryKey: employeeMeetingsQueryKeys.list(params),
    queryFn: () => employeeMeetingsApi.getMeetings(params),
  });
}

export function useUpcomingMeetings(params?: { per_page?: number; page?: number }) {
  return useQuery({
    queryKey: employeeMeetingsQueryKeys.upcoming(params),
    queryFn: () => employeeMeetingsApi.getUpcomingMeetings(params),
  });
}

export function useEmployeeMeetingDetails(meetingId: number) {
  return useQuery({
    queryKey: employeeMeetingsQueryKeys.detail(meetingId),
    queryFn: () => employeeMeetingsApi.getMeetingDetails(meetingId),
    enabled: !!meetingId,
  });
}

