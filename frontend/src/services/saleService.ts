import { api } from './api';
import type { Sale, CreateSalePayload } from '../types';

export const saleService = {
  getAll: () =>
    api.get<Sale[]>('/sales').then((r) => r.data),

  create: (data: CreateSalePayload) =>
    api.post<Sale>('/sales', data).then((r) => r.data),
};
