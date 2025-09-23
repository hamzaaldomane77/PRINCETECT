import { apiClient } from '@/lib/api-client';
import {
  Client,
  ClientsResponse,
  ClientDetailsResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientFilters,
} from '../types';

const API_BASE = '/api/v1/admin/clients';

export class ClientsAPI {
  // Get all clients with filters
  static async getClients(filters: ClientFilters = {}): Promise<ClientsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.industry) queryParams.append('industry', filters.industry);
    if (filters.size) queryParams.append('size', filters.size);
    if (filters.city_id) queryParams.append('city_id', filters.city_id.toString());
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<ClientsResponse>(endpoint);
  }

  // Get client by ID
  static async getClientById(id: number): Promise<Client> {
    try {
      const result = await apiClient.get<ClientDetailsResponse>(`${API_BASE}/${id}`);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      if (!result.success) {
        throw new Error((result as any).message || 'API request failed');
      }
      
      if (!result.data) {
        throw new Error('Client not found in response data');
      }
      
      return result.data;
    } catch (error) {
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Handle HTTP errors
      const errorMessage = (error as any)?.message || error?.toString?.() || '';
      if (errorMessage.includes('404')) {
        throw new Error(`Client with ID ${id} not found`);
      }
      
      if (errorMessage.includes('401') || errorMessage.includes('Authentication')) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (errorMessage.includes('403')) {
        throw new Error('Access denied. You do not have permission to view this client.');
      }
      
      if (errorMessage.includes('500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      // Re-throw the original error if it already has a message
      throw error;
    }
  }

  // Create new client
  static async createClient(data: CreateClientRequest): Promise<Client> {
    const apiData = {
      ...data,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined,
    };

    // Remove undefined values to avoid sending them to the API
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof typeof apiData] === undefined) {
        delete apiData[key as keyof typeof apiData];
      }
    });

    const result = await apiClient.post<{ success: boolean; data: { client: Client } }>(API_BASE, apiData);
    
    if (!result.success) {
      throw new Error('Failed to create client');
    }
    
    return result.data.client;
  }

  // Update client
  static async updateClient(id: number, data: UpdateClientRequest): Promise<Client> {
    const apiData = {
      ...data,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : undefined,
    };

    // Remove undefined values to avoid sending them to the API
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof typeof apiData] === undefined) {
        delete apiData[key as keyof typeof apiData];
      }
    });

    const result = await apiClient.put<{ success: boolean; data: { client: Client } }>(`${API_BASE}/${id}`, apiData);
    
    if (!result.success) {
      throw new Error('Failed to update client');
    }
    
    return result.data.client;
  }

  // Delete client
  static async deleteClient(id: number): Promise<void> {
    try {
      const result = await apiClient.delete<{ success: boolean; message?: string }>(`${API_BASE}/${id}`);
      
      if (!result.success) {
        // Check for specific error messages
        const errorMessage = result.message || 'Failed to delete client';
        
        // Check for any business logic constraints
        if (errorMessage.includes('has active contracts') || 
            errorMessage.includes('has pending orders') ||
            errorMessage.includes('Cannot delete client')) {
          throw new Error('CANNOT_DELETE_CLIENT_WITH_RELATIONS');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle specific error cases
      if ((error as Error)?.message === 'CANNOT_DELETE_CLIENT_WITH_RELATIONS') {
        throw error; // Re-throw as is for specific handling
      }
      
      // Handle other HTTP errors
      const errorMessage = (error as any)?.message || error?.toString?.() || '';
      if (errorMessage.includes('403')) {
        throw new Error('Access denied. You do not have permission to delete this client.');
      }
      
      if (errorMessage.includes('404')) {
        throw new Error(`Client with ID ${id} not found.`);
      }
      
      throw error;
    }
  }

  // Toggle client status
  static async toggleClientStatus(id: number): Promise<Client> {
    const result = await apiClient.patch<{ success: boolean; data: { client: Client } }>(`${API_BASE}/${id}/toggle-status`);
    
    if (!result.success) {
      throw new Error('Failed to toggle client status');
    }
    
    return result.data.client;
  }

  // Activate client
  static async activateClient(id: number): Promise<Client> {
    const result = await apiClient.patch<{ success: boolean; data: { client: Client } }>(`${API_BASE}/${id}/activate`);
    
    if (!result.success) {
      throw new Error('Failed to activate client');
    }
    
    return result.data.client;
  }

  // Suspend client
  static async suspendClient(id: number, reason?: string): Promise<Client> {
    const data = reason ? { reason } : {};
    const result = await apiClient.patch<{ success: boolean; data: { client: Client } }>(`${API_BASE}/${id}/suspend`, data);
    
    if (!result.success) {
      throw new Error('Failed to suspend client');
    }
    
    return result.data.client;
  }
}
