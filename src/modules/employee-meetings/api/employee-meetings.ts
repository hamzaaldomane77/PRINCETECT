import { apiClient } from '@/lib/api-client';
import { 
  EmployeeMeetingsResponse, 
  EmployeeMeetingDetailsResponse 
} from '../types';

const BASE_PATH = '/api/v1/employee/meetings';

export const employeeMeetingsApi = {
  /**
   * Get employee meetings
   */
  getMeetings: async (params?: {
    per_page?: number;
    page?: number;
  }): Promise<EmployeeMeetingsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const url = queryParams.toString() 
      ? `${BASE_PATH}?${queryParams.toString()}` 
      : BASE_PATH;

    return apiClient.get<EmployeeMeetingsResponse>(url);
  },

  /**
   * Get upcoming meetings
   */
  getUpcomingMeetings: async (params?: {
    per_page?: number;
    page?: number;
  }): Promise<EmployeeMeetingsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const url = queryParams.toString() 
      ? `${BASE_PATH}/upcoming?${queryParams.toString()}` 
      : `${BASE_PATH}/upcoming`;

    return apiClient.get<EmployeeMeetingsResponse>(url);
  },

  /**
   * Get meeting details
   */
  getMeetingDetails: async (meetingId: number): Promise<EmployeeMeetingDetailsResponse> => {
    return apiClient.get<EmployeeMeetingDetailsResponse>(`${BASE_PATH}/${meetingId}`);
  }
};

