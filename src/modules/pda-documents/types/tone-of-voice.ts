export interface ToneOfVoice {
  id: number;
  pda_document_id: number;
  personality: string | null;
  summary: string | null;
  bio: string | null;
  msgs_comments_response: string | null;
  keywords: string | null;
  brand_slogan: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToneOfVoiceResponse {
  success: boolean;
  data: ToneOfVoice;
}

export interface CreateToneOfVoiceRequest {
  personality?: string | null;
  summary?: string | null;
  bio?: string | null;
  msgs_comments_response?: string | null;
  keywords?: string | null;
  brand_slogan?: string | null;
}

export interface UpdateToneOfVoiceRequest {
  personality?: string | null;
  summary?: string | null;
  bio?: string | null;
  msgs_comments_response?: string | null;
  keywords?: string | null;
  brand_slogan?: string | null;
}

