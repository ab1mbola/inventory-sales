import { api } from './api';
import type { Customer } from '../types';

export const customerService = {
  getAll: () =>
    api.get<Customer[]>('/customers').then((r) => r.data),

  getById: (id: string) =>
    api.get<Customer>(`/customers/${id}`).then((r) => r.data),

  create: (data: Partial<Customer>) =>
    api.post<Customer>('/customers', data).then((r) => r.data),

  update: (id: string, data: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/customers/${id}`).then((r) => r.data),
};
