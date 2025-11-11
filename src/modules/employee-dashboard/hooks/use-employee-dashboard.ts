import { useQuery } from '@tanstack/react-query';
import { employeeDashboardApi } from '../api/employee-dashboard';

export const employeeDashboardQueryKeys = {
  all: ['employee-dashboard'] as const,
  overview: () => [...employeeDashboardQueryKeys.all, 'overview'] as const,
};

export function useDashboardOverview() {
  return useQuery({
    queryKey: employeeDashboardQueryKeys.overview(),
    queryFn: () => employeeDashboardApi.getOverview(),
  });
}

