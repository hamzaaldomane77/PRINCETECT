// Service Types
export interface Service {
  id: number;
  name: string;
  description: string;
  department_id: number;
  service_category_id: number;
  base_price: string;
  currency: string;
  is_active: boolean;
  features: string[] | null;
  delivery_time_days: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
}

export interface ServicesResponse {
  success: boolean;
  data: {
    services: Service[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  department_id: number;
  service_category_id: number;
  base_price: string;
  currency: string;
  is_active?: boolean;
  features?: string[];
  delivery_time_days: number;
  notes?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  department_id?: number;
  service_category_id?: number;
  base_price?: string;
  currency?: string;
  is_active?: boolean;
  features?: string[];
  delivery_time_days?: number;
  notes?: string;
}

export interface ServiceFilters {
  q?: string;
  active?: boolean;
  category_id?: number;
  department_id?: number;
  per_page?: number;
  page?: number;
}
