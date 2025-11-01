export interface Quotation {
  id: number;
  lead_id: number | null;
  quotation_number: string;
  title: string;
  description: string;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  discount_rate: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'modified';
  sent_date: string | null;
  accepted_date: string | null;
  rejected_date: string | null;
  rejection_reason: string | null;
  notes: string;
  terms_conditions: string;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  meeting_id: number;
  client_id: number | null;
  lead: any | null;
  client: any | null;
  assigned_employee: any | null;
  quotation_services: QuotationService[];
}

export interface QuotationService {
  id: number;
  quotation_id: number;
  service_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  description: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  service?: {
    id: number;
    name: string;
    description: string;
    department_id: number;
    service_category_id: number;
    base_price: string;
    currency: string;
    is_active: boolean;
    features?: string[];
    delivery_time_days: number;
    notes?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateQuotationRequest {
  lead_id?: number | null;
  client_id?: number | null;
  quotation_number: string;
  title: string;
  description?: string;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  discount_rate?: number;
  discount_amount?: number;
  total_amount?: number;
  currency?: string;
  valid_until?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'modified';
  notes?: string;
  terms_conditions?: string;
  assigned_to?: number | null;
  quotation_services?: Omit<QuotationService, 'id' | 'quotation_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateQuotationRequest extends Partial<CreateQuotationRequest> {
  id: number;
}

export interface QuotationFilters {
  page?: number;
  per_page?: number;
  status?: string;
  client_id?: number;
  lead_id?: number;
  assigned_to?: number;
  search?: string;
}

export interface QuotationsResponse {
  success: boolean;
  data: {
    quotations: Quotation[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface QuotationResponse {
  success: boolean;
  data: Quotation;
}
