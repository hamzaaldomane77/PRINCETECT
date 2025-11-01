// Goal Types for PDA Documents

export interface Goal {
  id: number;
  pda_document_id: number;
  goal_title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalsResponse {
  success: boolean;
  data: {
    goals: Goal[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface GoalDetailsResponse {
  success: boolean;
  data: Goal;
}

export interface CreateGoalRequest {
  goal_title: string;
  description?: string | null;
}

export interface UpdateGoalRequest {
  goal_title?: string;
  description?: string | null;
}

