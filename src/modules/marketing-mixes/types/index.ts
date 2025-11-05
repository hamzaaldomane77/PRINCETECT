// Marketing Mix interface
export interface MarketingMix {
  id: number;
  pda_document_id: number;
  element: string;
  title: string;
  description: string | null;
  notes: string | null;
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

// API Response Types
export interface MarketingMixesResponse {
  success: boolean;
  data: {
    marketing_mixes: MarketingMix[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface MarketingMixDetailsResponse {
  success: boolean;
  data: MarketingMix;
  message: string;
}

// Request Types for Creating/Updating Marketing Mixes
export interface CreateMarketingMixRequest {
  pda_document_id: string | number;
  element: string;
  title: string;
  description?: string | null;
  notes?: string | null;
}

export interface UpdateMarketingMixRequest {
  pda_document_id?: string | number;
  element?: string;
  title?: string;
  description?: string | null;
  notes?: string | null;
}

// Filter Types
export interface MarketingMixFilters {
  pda_document_id?: number;
  element?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// Element Options (4 Ps of Marketing)
export const ELEMENT_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'price', label: 'Price' },
  { value: 'place', label: 'Place' },
  { value: 'promotion', label: 'Promotion' },
];

