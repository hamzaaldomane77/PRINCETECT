import { useQuery } from '@tanstack/react-query';
import { DashboardAPI } from '../api/dashboard';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => DashboardAPI.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
