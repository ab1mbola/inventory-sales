import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from '../services/saleService';
import type { CreateSalePayload } from '../types';

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: saleService.getAll,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSalePayload) => saleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // stock changed
    },
  });
}
