import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import type { CompanySettings } from '../services/settingsService';

export function useCompanySettings(enabled: boolean = true) {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: settingsService.getCompany,
    enabled,
    retry: false,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompanySettings>) => settingsService.updateCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string }) => settingsService.updateProfile(data),
    onSuccess: () => {
      // Potentially invalidate user query if present
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) => 
      settingsService.changePassword(data),
  });
}
