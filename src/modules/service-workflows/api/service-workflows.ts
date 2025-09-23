import { apiClient } from '@/lib/api-client';
import {
  ServiceWorkflow,
  ServiceWorkflowsResponse,
  CreateServiceWorkflowRequest,
  UpdateServiceWorkflowRequest,
  ServiceWorkflowLookupResponse
} from '../types';

const API_BASE = '/api/v1/admin/service-workflows';

export class ServiceWorkflowsAPI {
  static async getServiceWorkflows(params: {
    q?: string;
    active?: number;
    default?: number;
    service_id?: number;
    per_page?: number;
    page?: number;
  } = {}): Promise<ServiceWorkflowsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.active !== undefined) searchParams.append('active', params.active.toString());
    if (params.default !== undefined) searchParams.append('default', params.default.toString());
    if (params.service_id) searchParams.append('service_id', params.service_id.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params.page) searchParams.append('page', params.page.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;
    
    const result = await apiClient.get<ServiceWorkflowsResponse>(url);
    if (!result.success) {
      throw new Error('Failed to fetch service workflows');
    }
    return result;
  }

  static async getServiceWorkflow(id: number): Promise<ServiceWorkflow> {
    const result = await apiClient.get<any>(`${API_BASE}/${id}`);
    if (!result.success) {
      throw new Error('Failed to fetch service workflow');
    }
    return result.data.workflow;
  }

  static async createServiceWorkflow(data: CreateServiceWorkflowRequest): Promise<ServiceWorkflow> {
    const result = await apiClient.post<any>(API_BASE, data);
    if (!result.success) {
      throw new Error('Failed to create service workflow');
    }
    return result.data.workflow;
  }

  static async updateServiceWorkflow(id: number, data: UpdateServiceWorkflowRequest): Promise<ServiceWorkflow> {
    const result = await apiClient.put<{ success: boolean; data: ServiceWorkflow }>(`${API_BASE}/${id}`, data);
    if (!result.success) {
      throw new Error('Failed to update service workflow');
    }
    return result.data.workflow;
  }

  static async deleteServiceWorkflow(id: number): Promise<void> {
    const result = await apiClient.delete<{ success: boolean }>(`${API_BASE}/${id}`);
    if (!result.success) {
      throw new Error('Failed to delete service workflow');
    }
  }

  static async toggleServiceWorkflowStatus(id: number): Promise<ServiceWorkflow> {
    const result = await apiClient.patch<any>(`${API_BASE}/${id}/toggle-status`);
    if (!result.success) {
      throw new Error('Failed to toggle service workflow status');
    }
    return result.data.workflow;
  }

  static async getServicesLookup(q: string = '', active: number = 1): Promise<Array<{value: number; label: string}>> {
    const result = await apiClient.get<ServiceWorkflowLookupResponse>(`${API_BASE}/lookup/services?q=${q}&active=${active}`);
    if (!result.success) {
      throw new Error('Failed to fetch services lookup');
    }
    return result.data.options;
  }
}
