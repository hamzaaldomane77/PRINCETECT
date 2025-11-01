export interface Competitor {
  id: number;
  pda_document_id: number;
  name: string;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitorsResponse {
  success: boolean;
  data: {
    competitors: Competitor[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CompetitorDetailsResponse {
  success: boolean;
  data: Competitor;
}

export interface CreateCompetitorRequest {
  name: string;
  strengths?: string | null;
  weaknesses?: string | null;
  notes?: string | null;
}

export interface UpdateCompetitorRequest {
  name?: string;
  strengths?: string | null;
  weaknesses?: string | null;
  notes?: string | null;
}

