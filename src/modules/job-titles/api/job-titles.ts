import { apiClient } from '@/lib/api-client';
import {
  JobTitle,
  JobTitlesResponse,
  JobTitleDetailsResponse,
  CreateJobTitleRequest,
  UpdateJobTitleRequest,
  JobTitleFilters,
} from '../types';

const API_BASE = '/api/v1/admin/job-titles';

export class JobTitlesAPI {
  // Get all job titles with filters
  static async getJobTitles(filters: JobTitleFilters = {}): Promise<JobTitlesResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.q) queryParams.append('q', filters.q);
    if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    if (filters.department_id) queryParams.append('department_id', filters.department_id.toString());
    if (filters.level) queryParams.append('level', filters.level);
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    const endpoint = queryParams.toString() ? `${API_BASE}?${queryParams.toString()}` : API_BASE;
    return await apiClient.get<JobTitlesResponse>(endpoint);
  }

  // Get job title by ID
  static async getJobTitleById(id: number): Promise<JobTitle> {
    try {
      const result = await apiClient.get<JobTitleDetailsResponse>(`${API_BASE}/${id}`);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      if (!result.success) {
        throw new Error((result as any).message || 'API request failed');
      }
      
      if (!result.data) {
        throw new Error('Job title not found in response data');
      }
      
      return result.data;
    } catch (error) {
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      // Handle HTTP errors
      if (error?.message?.includes('404')) {
        throw new Error(`Job title with ID ${id} not found`);
      }
      
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (error?.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to view this job title.');
      }
      
      if (error?.message?.includes('500')) {
        throw new Error('Server error. Please try again later.');
      }
      
      // Re-throw the original error if it already has a message
      throw error;
    }
  }

  // Create new job title
  static async createJobTitle(data: CreateJobTitleRequest): Promise<JobTitle> {
    const result = await apiClient.post<{ success: boolean; data: { job_title: JobTitle } }>(API_BASE, data);
    
    if (!result.success) {
      throw new Error('Failed to create job title');
    }
    
    return result.data.job_title;
  }

  // Update job title
  static async updateJobTitle(id: number, data: UpdateJobTitleRequest): Promise<JobTitle> {
    const result = await apiClient.put<{ success: boolean; data: { job_title: JobTitle } }>(`${API_BASE}/${id}`, data);
    
    if (!result.success) {
      throw new Error('Failed to update job title');
    }
    
    return result.data.job_title;
  }

  // Delete job title
  static async deleteJobTitle(id: number): Promise<void> {
    try {
      const result = await apiClient.delete<{ success: boolean; message?: string }>(`${API_BASE}/${id}`);
      
      if (!result.success) {
        // Check for specific error messages
        const errorMessage = result.message || 'Failed to delete job title';
        
        // Check for exact message match and partial match
        if (errorMessage === 'Cannot delete job title that is assigned to employees' || 
            errorMessage.includes('assigned to employees')) {
          throw new Error('ASSIGNED_TO_EMPLOYEES');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle specific error cases
      if ((error as Error)?.message === 'ASSIGNED_TO_EMPLOYEES') {
        throw error; // Re-throw as is for specific handling
      }
      
      // Handle other HTTP errors
      if ((error as Error)?.message?.includes('403')) {
        throw new Error('Access denied. You do not have permission to delete this job title.');
      }
      
      if ((error as Error)?.message?.includes('404')) {
        throw new Error(`Job title with ID ${id} not found.`);
      }
      
      throw error;
    }
  }

  // Toggle job title status
  static async toggleJobTitleStatus(id: number): Promise<JobTitle> {
    const result = await apiClient.patch<{ success: boolean; data: { job_title: JobTitle } }>(`${API_BASE}/${id}/toggle-status`);
    
    if (!result.success) {
      throw new Error('Failed to toggle job title status');
    }
    
    return result.data.job_title;
  }
}
