import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Customer } from '../types';

export function useCustomers() {
  const queryClient = useQueryClient();

  const query = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => api.post('/customers', data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Customer>) => api.put(`/customers/${id}`, data).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  return {
    ...query,
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
