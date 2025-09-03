import { create } from 'zustand';
import { Service, CreateServiceRequest, UpdateServiceRequest, ServiceFilters } from '../types';
import { ServicesAPI } from '../api/services';

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  } | null;
  
  // Actions
  fetchServices: (filters?: ServiceFilters) => Promise<void>;
  fetchServiceById: (id: number) => Promise<Service | null>;
  createService: (serviceData: CreateServiceRequest) => Promise<void>;
  updateService: (id: number, serviceData: UpdateServiceRequest) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  toggleServiceStatus: (id: number, isActive: boolean) => Promise<void>;
  
  // State setters
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  meta: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchServices: async (filters = {}) => {
    try {
      set({ loading: true, error: null });
      const response = await ServicesAPI.getServices(filters);
      set({ 
        services: response.data.services, 
        meta: response.meta,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch services', 
        loading: false 
      });
    }
  },

  fetchServiceById: async (id) => {
    try {
      set({ loading: true, error: null });
      const service = await ServicesAPI.getServiceById(id);
      set({ loading: false });
      return service;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch service', 
        loading: false 
      });
      return null;
    }
  },

  createService: async (serviceData) => {
    try {
      set({ loading: true, error: null });
      await ServicesAPI.createService(serviceData);
      // Refresh the services list
      await get().fetchServices();
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create service', 
        loading: false 
      });
      throw error;
    }
  },

  updateService: async (id, serviceData) => {
    try {
      set({ loading: true, error: null });
      await ServicesAPI.updateService(id, serviceData);
      // Refresh the services list
      await get().fetchServices();
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update service', 
        loading: false 
      });
      throw error;
    }
  },

  deleteService: async (id) => {
    try {
      set({ loading: true, error: null });
      await ServicesAPI.deleteService(id);
      // Remove from local state
      set(state => ({
        services: state.services.filter(service => service.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete service', 
        loading: false 
      });
      throw error;
    }
  },

    toggleServiceStatus: async (id) => {
    try {
      set({ loading: true, error: null });
      await ServicesAPI.toggleServiceStatus(id);
      // Refresh the services list
      await get().fetchServices();
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle service status',
        loading: false 
      });
      throw error;
    }
  },
}));
