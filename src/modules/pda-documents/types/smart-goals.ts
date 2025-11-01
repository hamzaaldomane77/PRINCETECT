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

export interface SmartGoalsResponse {
  success: boolean;
  data: {
    smart_goals: SmartGoal[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface SmartGoalDetailsResponse {
  success: boolean;
  data: SmartGoal;
}

export interface CreateSmartGoalRequest {
  goal_title: string;
  specific?: string | null;
  measurable?: string | null;
  achievable?: string | null;
  relevant?: string | null;
  time_bound?: string | null;
}

export interface UpdateSmartGoalRequest {
  goal_title?: string;
  specific?: string | null;
  measurable?: string | null;
  achievable?: string | null;
  relevant?: string | null;
  time_bound?: string | null;
}

