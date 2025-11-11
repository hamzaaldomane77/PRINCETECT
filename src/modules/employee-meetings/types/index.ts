export interface EmployeeMeeting {
  id: number;
  title: string;
  description: string | null;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location: string | null;
  meeting_type: 'in_person' | 'video_call' | 'phone_call';
  category: 'lead' | 'client' | 'internal' | 'management';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  lead: {
    id: number;
    name: string;
    company_name: string;
  } | null;
  client: {
    id: number;
    name: string;
    company_name: string;
  } | null;
}

export interface EmployeeMeetingDetails extends EmployeeMeeting {
  agenda: string | null;
  outcomes: string[];
  action_items: string[];
  next_steps: string[];
  notes: string | null;
  participants: Array<{
    id: number;
    name: string;
    role?: string;
  }>;
  attachments: Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
  }>;
}

export interface EmployeeMeetingsResponse {
  success: boolean;
  data: {
    meetings: EmployeeMeeting[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EmployeeMeetingDetailsResponse {
  success: boolean;
  data: EmployeeMeetingDetails;
}

