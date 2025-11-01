export interface TargetAudience {
  id: number;
  pda_document_id: number;
  audience_name: string;
  description: string | null;
  demographics: string | null;
  psychographics: string | null;
  created_at: string;
  updated_at: string;
}

export interface TargetAudiencesResponse {
  success: boolean;
  data: {
    target_audiences: TargetAudience[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface TargetAudienceDetailsResponse {
  success: boolean;
  data: TargetAudience;
}

export interface CreateTargetAudienceRequest {
  audience_name: string;
  description?: string | null;
  demographics?: string | null;
  psychographics?: string | null;
}

export interface UpdateTargetAudienceRequest {
  audience_name?: string;
  description?: string | null;
  demographics?: string | null;
  psychographics?: string | null;
}

