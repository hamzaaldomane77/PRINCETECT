import { useQuery } from '@tanstack/react-query';
import { ServicesLookupAPI, LookupOption } from '../api/lookup';

export const useServiceCategoriesLookup = (q: string = '', active: number = 1) => {
  return useQuery<LookupOption[]>({
    queryKey: ['service-categories-lookup', q, active],
    queryFn: () => ServicesLookupAPI.getCategories(q, active),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDepartmentsLookup = (q: string = '', active: number = 1) => {
  return useQuery<LookupOption[]>({
    queryKey: ['departments-lookup', q, active],
    queryFn: () => ServicesLookupAPI.getDepartments(q, active),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCurrenciesLookup = () => {
  return useQuery<LookupOption[]>({
    queryKey: ['currencies-lookup'],
    queryFn: () => ServicesLookupAPI.getCurrencies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
