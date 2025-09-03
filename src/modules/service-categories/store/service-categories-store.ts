import { create } from 'zustand';
import { ServiceCategory, ServiceCategoryFilters, CreateServiceCategoryRequest, UpdateServiceCategoryRequest } from '../types';
import { ServiceCategoriesAPI } from '../api/service-categories';

interface ServiceCategoriesState {
  categories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  } | null;
  
  // Actions
  fetchCategories: (filters?: ServiceCategoryFilters) => Promise<void>;
  fetchCategoryById: (id: number) => Promise<ServiceCategory | null>;
  createCategory: (data: CreateServiceCategoryRequest) => Promise<void>;
  updateCategory: (id: number, data: UpdateServiceCategoryRequest) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  toggleCategoryStatus: (id: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useServiceCategoriesStore = create<ServiceCategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  meta: null,

  fetchCategories: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await ServiceCategoriesAPI.getServiceCategories(filters);
      set({ 
        categories: response.data.categories, 
        meta: response.meta,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        loading: false 
      });
    }
  },

  fetchCategoryById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const category = await ServiceCategoriesAPI.getServiceCategoryById(id);
      set({ loading: false });
      return category;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch category',
        loading: false 
      });
      return null;
    }
  },

  createCategory: async (data: any) => {
    set({ loading: true, error: null });
    try {
      await ServiceCategoriesAPI.createServiceCategory(data);
      await get().fetchCategories(); // Refresh the list
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create category',
        loading: false 
      });
    }
  },

  updateCategory: async (id: number, data: any) => {
    set({ loading: true, error: null });
    try {
      await ServiceCategoriesAPI.updateServiceCategory(id, data);
      await get().fetchCategories(); // Refresh the list
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update category',
        loading: false 
      });
    }
  },

  deleteCategory: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await ServiceCategoriesAPI.deleteServiceCategory(id);
      await get().fetchCategories(); // Refresh the list
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete category',
        loading: false 
      });
    }
  },

  toggleCategoryStatus: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await ServiceCategoriesAPI.toggleServiceCategoryStatus(id);
      await get().fetchCategories(); // Refresh the list
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle category status',
        loading: false 
      });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
