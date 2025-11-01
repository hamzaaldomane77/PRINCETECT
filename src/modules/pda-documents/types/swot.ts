export interface SwotAnalysis {
  id: number;
  pda_document_id: number;
  strengths: string | null;
  weaknesses: string | null;
  opportunities: string | null;
  threats: string | null;
  created_at: string;
  updated_at: string;
}

export interface SwotAnalysisResponse {
  success: boolean;
  data: SwotAnalysis;
  message: string;
}

export interface SaveSwotAnalysisRequest {
  strengths?: string | null;
  weaknesses?: string | null;
  opportunities?: string | null;
  threats?: string | null;
}

