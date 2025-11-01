export interface MarketSegmentation {
  id: number;
  pda_document_id: number;
  segment_name: string;
  description: string | null;
  criteria: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketSegmentationsResponse {
  success: boolean;
  data: {
    market_segmentations: MarketSegmentation[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface MarketSegmentationDetailsResponse {
  success: boolean;
  data: MarketSegmentation;
}

export interface CreateMarketSegmentationRequest {
  segment_name: string;
  description?: string | null;
  criteria?: string | null;
}

export interface UpdateMarketSegmentationRequest {
  segment_name?: string;
  description?: string | null;
  criteria?: string | null;
}

