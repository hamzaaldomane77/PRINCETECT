import { apiClient } from '@/lib/api-client';
import { EmployeeProfileResponse, UpdateEmployeeProfileRequest } from '../types';

export class EmployeeProfileAPI {
  private static baseUrl = '/api/v1/employee/profile';

  // Get employee profile
  static async getProfile(): Promise<EmployeeProfileResponse> {
    return await apiClient.get<EmployeeProfileResponse>(this.baseUrl);
  }

  // Update employee profile
  static async updateProfile(data: UpdateEmployeeProfileRequest): Promise<EmployeeProfileResponse> {
    return await apiClient.put<EmployeeProfileResponse>(this.baseUrl, data as unknown as Record<string, unknown>);
  }

  // Update employee profile with photo
  static async updateProfileWithPhoto(data: UpdateEmployeeProfileRequest, photo: File): Promise<EmployeeProfileResponse> {
    const formData = new FormData();
    
    // Append all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });
    
    // Append photo file
    formData.append('photo', photo, photo.name);
    
    // Use PUT method with _method override for Laravel
    formData.append('_method', 'PUT');
    
    return await apiClient.postFormData<EmployeeProfileResponse>(this.baseUrl, formData);
  }
}

