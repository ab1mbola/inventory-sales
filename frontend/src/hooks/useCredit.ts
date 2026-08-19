import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { DebtorStats, CustomerDebtDetails, RecordPaymentPayload } from '../types';

export function useCredit() {
  const queryClient = useQueryClient();

  const creditCustomersQuery = useQuery<DebtorStats[]>({
    queryKey: ['credit-customers'],
    queryFn: () => api.get('/debt').then((res) => res.data),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: RecordPaymentPayload) => api.post('/debt/payment', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-credit'] });
    },
  });

  return {
    creditCustomers: creditCustomersQuery.data,
    isLoadingCredit: creditCustomersQuery.isLoading,
    recordPayment: recordPaymentMutation.mutateAsync,
    isRecordingPayment: recordPaymentMutation.isPending,
  };
}

export function useCustomerCredit(id?: string) {
  return useQuery<CustomerDebtDetails>({
    queryKey: ['customer-credit', id],
    queryFn: () => api.get(`/debt/${id}`).then((res) => res.data),
    enabled: !!id,
  });
}
