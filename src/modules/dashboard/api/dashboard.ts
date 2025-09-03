import { apiClient } from '@/lib/api-client';

const API_BASE = '/api/v1/admin/dashboard';

export interface DashboardOverview {
  customers: {
    total: number;
    active: number;
    inactive: number;
    leads: number;
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  business: {
    contracts_total: number;
    contracts_active: number;
    quotations_total: number;
    quotations_pending: number;
    meetings_total: number;
    meetings_upcoming: number;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardOverview;
  meta: any;
}

export class DashboardAPI {
  // Get dashboard overview statistics
  static async getDashboardOverview(): Promise<DashboardResponse> {
    return await apiClient.get<DashboardResponse>(`${API_BASE}/overview`);
  }
}
