import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeProfileAPI } from '../api/employee-profile';
import { UpdateEmployeeProfileRequest } from '../types';

// Query keys
const employeeProfileQueryKeys = {
  all: ['employee-profile'] as const,
  profile: () => [...employeeProfileQueryKeys.all, 'detail'] as const,
};

// Get employee profile
export function useEmployeeProfile() {
  return useQuery({
    queryKey: employeeProfileQueryKeys.profile(),
    queryFn: () => EmployeeProfileAPI.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update employee profile
export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, photo }: { data: UpdateEmployeeProfileRequest; photo?: File }) => {
      if (photo) {
        return EmployeeProfileAPI.updateProfileWithPhoto(data, photo);
      }
      return EmployeeProfileAPI.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeProfileQueryKeys.all });
    },
  });
}

