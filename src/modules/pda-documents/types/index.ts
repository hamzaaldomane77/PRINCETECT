// Employee type for created_by field
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string | null;
  mother_name: string | null;
  birth_date: string | null;
  gender: string;
  city_id: number;
  address: string | null;
  marital_status: string;
  military_status: string | null;
  employee_id: string;
  job_title_id: number;
  department_id: number;
  department_manager_id: number | null;
  hire_date: string;
  team_name: string | null;
  employee_type_id: number;
  job_description: string | null;
  work_mobile: string | null;
  office_phone: string | null;
  work_email: string;
  email: string;
  business_number: string | null;
  office_number: string | null;
  phone_number: string | null;
  home_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  emergency_contact_relationship: string | null;
  personal_mobile: string | null;
  home_phone: string | null;
  personal_email: string | null;
  status: string;
  last_login_at: string | null;
  notes: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  name: string;
}

// Contract type for contract field
export interface Contract {
  id: number;
  quotation_id: number | null;
  lead_id: number | null;
  contract_number: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  total_value: string;
  total_amount: string;
  advance_payment: string;
  remaining_amount: string;
  currency: string;
  payment_terms: string;
  payment_schedule: string[] | null;
  is_active: boolean;
  status: string;
  contract_type: string;
  signed_date: string | null;
  cancelled_date: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  terms_conditions: string | null;
  assigned_to: number | null;
  project_manager: number | null;
  created_at: string;
  updated_at: string;
  client_id: number | null;
}

// PDA Document Status Type
export type PdaDocumentStatus = 'draft' | 'approved' | 'rejected';

// Marketing Channel
export interface MarketingChannel {
  id: number;
  pda_document_id: number;
  channel_type: string;
  name: string;
  details: string[] | null;
  created_at: string;
  updated_at: string;
}

// Marketing Mix
export interface MarketingMix {
  id: number;
  pda_document_id: number;
  element: string;
  title: string;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Goal
export interface Goal {
  id: number;
  pda_document_id: number;
  goal_title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// SMART Goal
export interface SmartGoal {
  id: number;
  pda_document_id: number;
  goal_title: string;
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  time_bound: string | null;
  created_at: string;
  updated_at: string;
}

// SWOT Analysis
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

// Competitor
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

// Market Segmentation
export interface MarketSegmentation {
  id: number;
  pda_document_id: number;
  segment_name: string;
  description: string | null;
  criteria: string | null;
  created_at: string;
  updated_at: string;
}

// Target Audience
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

// Market Challenge
export interface MarketChallenge {
  id: number;
  pda_document_id: number;
  challenge_title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// AIDA Funnel
export interface AidaFunnel {
  id: number;
  pda_document_id: number;
  stage: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

// PDA Document interface
export interface PdaDocument {
  id: number;
  contract_id: number;
  customer_id: number;
  created_by: Employee;
  status: PdaDocumentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contract: Contract;
  roles: any[];
  marketing_channels: MarketingChannel[];
  marketing_mixes: MarketingMix[];
  tone_of_voice: string | null;
  goals: Goal[];
  smart_goals: SmartGoal[];
  swot_analysis: SwotAnalysis | null;
  competitors: Competitor[];
  market_segmentations: MarketSegmentation[];
  target_audiences: TargetAudience[];
  market_challenges: MarketChallenge[];
  aida_funnels: AidaFunnel[];
}

// API Response Types
export interface PdaDocumentsResponse {
  success: boolean;
  data: {
    pda_documents: PdaDocument[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface PdaDocumentDetailsResponse {
  success: boolean;
  data: PdaDocument;
  message: string;
}

// Request Types for Creating/Updating PDA Documents
export interface CreatePdaDocumentRequest {
  contract_id: number;
  customer_id: number;
  status: PdaDocumentStatus;
  notes?: string | null;
}

export interface UpdatePdaDocumentRequest {
  contract_id?: number;
  customer_id?: number;
  status?: PdaDocumentStatus;
  notes?: string | null;
}

// Filter Types
export interface PdaDocumentFilters {
  status?: PdaDocumentStatus;
  contract_id?: number;
  customer_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

// Lookup item for dropdowns
export interface LookupItem {
  id: number;
  name?: string;
  title?: string;
  contract_number?: string;
  company_name?: string | null;
  email?: string;
  [key: string]: any;
}

// Lookup Response
export interface LookupResponse {
  success: boolean;
  data: LookupItem[];
}

// Status Options
export interface StatusOption {
  value: PdaDocumentStatus;
  label: string;
}

// Constants for dropdowns
export const PDA_STATUS_OPTIONS: StatusOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

