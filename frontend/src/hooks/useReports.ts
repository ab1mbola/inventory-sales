import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ReportData } from '../types';

export function useReports() {
  return useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: () => api.get('/reports/stats').then((res) => res.data),
  });
}
