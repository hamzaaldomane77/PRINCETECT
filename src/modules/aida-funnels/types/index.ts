export interface AidaFunnel {
  id: number;
  pda_document_id: number;
  stage: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  pda_document?: {
    id: number;
    contract_id: number;
    customer_id: number;
    created_by: number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface AidaFunnelsResponse {
  success: boolean;
  data: {
    aida_funnels: AidaFunnel[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface AidaFunnelDetailsResponse {
  success: boolean;
  data: AidaFunnel;
  message: string;
}

export interface CreateAidaFunnelRequest {
  contract_id: number;
  stage: string;
  description?: string | null;
  order: number;
  pda_document_id: number;
}

export interface UpdateAidaFunnelRequest {
  contract_id?: number;
  stage?: string;
  description?: string | null;
  order?: number;
  pda_document_id?: number;
}

export interface ReorderAidaFunnelsRequest {
  funnels: Array<{
    id: number;
    order: number;
  }>;
}

export interface ReorderAidaFunnelsResponse {
  success: boolean;
  message: string;
}

export type AidaFunnelStage = 'attention' | 'interest' | 'desire' | 'action';

export const AIDA_STAGES: { value: AidaFunnelStage; label: string }[] = [
  { value: 'attention', label: 'Attention' },
  { value: 'interest', label: 'Interest' },
  { value: 'desire', label: 'Desire' },
  { value: 'action', label: 'Action' },
];

