import { apiClient } from '@/lib/api-client';

const API_BASE = '/api/v1/admin/services/lookup';

export interface LookupOption {
  value: string | number;
  label: string;
}

export interface LookupResponse {
  success: boolean;
  data: {
    options: LookupOption[];
  };
  meta: any;
}

export class ServicesLookupAPI {
  static async getCategories(q: string = '', active: number = 1): Promise<LookupOption[]> {
    const result = await apiClient.get<LookupResponse>(`${API_BASE}/categories?q=${q}&active=${active}`);
    if (!result.success) {
      throw new Error('Failed to fetch service categories');
    }
    return result.data.options;
  }

  static async getDepartments(q: string = '', active: number = 1): Promise<LookupOption[]> {
    const result = await apiClient.get<LookupResponse>(`${API_BASE}/departments?q=${q}&active=${active}`);
    if (!result.success) {
      throw new Error('Failed to fetch departments');
    }
    return result.data.options;
  }

  static async getCurrencies(): Promise<LookupOption[]> {
    const result = await apiClient.get<LookupResponse>(`${API_BASE}/currencies`);
    if (!result.success) {
      throw new Error('Failed to fetch currencies');
    }
    return result.data.options;
  }
}
