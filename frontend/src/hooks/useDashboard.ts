import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { DashboardData } from '../types';

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard/stats').then((res) => res.data),
    refetchInterval: 30000, // Auto-refresh every 30s
  });
}
