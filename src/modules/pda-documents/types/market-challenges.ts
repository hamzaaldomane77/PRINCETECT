export interface MarketChallenge {
  id: number;
  pda_document_id: number;
  challenge_title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketChallengesResponse {
  success: boolean;
  data: {
    market_challenges: MarketChallenge[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface MarketChallengeDetailsResponse {
  success: boolean;
  data: MarketChallenge;
}

export interface CreateMarketChallengeRequest {
  challenge_title: string;
  description?: string | null;
}

export interface UpdateMarketChallengeRequest {
  challenge_title?: string;
  description?: string | null;
}

