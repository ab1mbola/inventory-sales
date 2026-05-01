import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000, // Auto-refresh every 30s
  });
}
