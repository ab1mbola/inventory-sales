import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { DebtorStats, CustomerDebtDetails, RecordPaymentPayload } from '../types';

export function useDebt() {
  const queryClient = useQueryClient();

  const debtorsQuery = useQuery<DebtorStats[]>({
    queryKey: ['debtors'],
    queryFn: () => api.get('/debt').then((res) => res.data),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: RecordPaymentPayload) => api.post('/debt/payment', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
      queryClient.invalidateQueries({ queryKey: ['customer-debt'] });
    },
  });

  return {
    debtors: debtorsQuery.data,
    isLoadingDebtors: debtorsQuery.isLoading,
    recordPayment: recordPaymentMutation.mutateAsync,
    isRecordingPayment: recordPaymentMutation.isPending,
  };
}

export function useCustomerDebt(id?: string) {
  return useQuery<CustomerDebtDetails>({
    queryKey: ['customer-debt', id],
    queryFn: () => api.get(`/debt/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}
