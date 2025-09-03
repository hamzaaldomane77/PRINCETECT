import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CitiesAPI, CreateCityData, UpdateCityData } from '../api/cities';

export function useCities(params?: {
  search?: string;
  country?: string;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ['cities', params],
    queryFn: () => CitiesAPI.getCities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCity(id: number) {
  return useQuery({
    queryKey: ['city', id],
    queryFn: () => CitiesAPI.getCity(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCityData) => CitiesAPI.createCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

export function useUpdateCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCityData }) => 
      CitiesAPI.updateCity(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', id] });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => CitiesAPI.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}

export function useToggleCityStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => CitiesAPI.toggleCityStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
}
