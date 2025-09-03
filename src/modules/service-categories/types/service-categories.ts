export interface ServiceCategory {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoriesResponse {
  success: boolean;
  data: {
    categories: ServiceCategory[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateServiceCategoryRequest {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateServiceCategoryRequest {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  notes?: string;
}

export interface ServiceCategoryFilters {
  q?: string;
  active?: boolean;
  per_page?: number;
  page?: number;
}
