import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import type { Customer } from '../types';

export function useCustomers() {
  const queryClient = useQueryClient();

  const query = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => customerService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Customer>) => customerService.update(id as string, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.delete(id),
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
