import { apiClient } from '@/lib/api-client';
import { 
  MeetingsResponse, 
  MeetingResponse, 
  CreateMeetingRequest, 
  UpdateMeetingRequest 
} from '../types';

export const meetingsApi = {
  // Get all meetings
  getMeetings: async (): Promise<MeetingsResponse> => {
    const response = await apiClient.get<MeetingsResponse>('/api/v1/admin/meetings');
    console.log('Meetings API Response:', response);
    return response;
  },

  // Get meeting by ID - Fixed for new API structure
  getMeeting: async (id: number): Promise<MeetingResponse> => {
    console.log('🔍 Fetching meeting with ID:', id);
    
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/meetings/${id}`);
      console.log('📡 Raw API Response:', response);
      
      // Check if response is successful
      if (!response.success) {
        console.log('❌ API returned success: false');
        return {
          success: false,
          data: { meeting: undefined },
          message: 'API returned success: false'
        };
      }
      
      // Check if we have data
      if (!response.data) {
        console.log('❌ No data in response');
        return {
          success: false,
          data: { meeting: undefined },
          message: 'No data in response'
        };
      }
      
      // Case 1: Meeting data directly in data (current case)
      if (response.data.id && response.data.title) {
        console.log('✅ Found meeting data directly in data:', response.data);
        console.log('📊 Meeting details:', {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          meeting_type: response.data.meeting_type
        });
        return {
          success: true,
          data: { meeting: response.data },
          message: 'Meeting found successfully'
        };
      }
      
      // Case 2: Single meeting in data.meeting (alternative structure)
      if (response.data.meeting) {
        console.log('✅ Found single meeting in data.meeting:', response.data.meeting);
        return {
          success: true,
          data: { meeting: response.data.meeting },
          message: 'Meeting found successfully'
        };
      }
      
      // Case 3: Multiple meetings in data.meetings array (fallback)
      if (response.data.meetings && Array.isArray(response.data.meetings)) {
        console.log('📋 Found meetings array with', response.data.meetings.length, 'meetings');
        const targetId = Number(id);
        const meeting = response.data.meetings.find((m: any) => Number(m.id) === targetId);
        
        if (meeting) {
          console.log('✅ Found meeting in array:', meeting);
          return {
            success: true,
            data: { meeting: meeting },
            message: 'Meeting found successfully'
          };
        } else {
          console.log('❌ Meeting not found in array');
          return {
            success: false,
            data: { meeting: undefined },
            message: `Meeting with ID ${id} not found in array`
          };
        }
      }
      
      // Case 4: No meeting data found
      console.log('❌ No meeting data found in response');
      console.log('📊 Response structure:', Object.keys(response.data));
      return {
        success: false,
        data: { meeting: undefined },
        message: 'No meeting data found'
      };
      
    } catch (error: any) {
      console.error('❌ Error fetching meeting:', error);
      return {
        success: false,
        data: { meeting: undefined },
        message: error.message || 'Error fetching meeting'
      };
    }
  },

  // Create new meeting
  createMeeting: async (data: CreateMeetingRequest): Promise<MeetingResponse> => {
    const response = await apiClient.post<MeetingResponse>('/api/v1/admin/meetings', data as unknown as Record<string, unknown>);
    return response;
  },

  // Update meeting
  updateMeeting: async (data: UpdateMeetingRequest): Promise<MeetingResponse> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put<MeetingResponse>(`/api/v1/admin/meetings/${id}`, updateData as unknown as Record<string, unknown>);
    return response;
  },

  // Delete meeting
  deleteMeeting: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/v1/admin/meetings/${id}`);
    return response;
  },
};