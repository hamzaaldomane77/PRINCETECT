import { apiClient } from '@/lib/api-client';
import { DashboardOverviewResponse } from '../types';

const BASE_PATH = '/api/v1/employee/dashboard';

export const employeeDashboardApi = {
  /**
   * Get dashboard overview
   */
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    return apiClient.get<DashboardOverviewResponse>(`${BASE_PATH}/overview`);
  }
};

