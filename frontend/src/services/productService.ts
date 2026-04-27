import { api } from './api';
import type { Product, CreateProductPayload } from '../types';

export const productService = {
  getAll: (params?: { search?: string; categoryId?: string; lowStock?: boolean }) =>
    api.get<Product[]>('/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: CreateProductPayload) =>
    api.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateProductPayload>) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/products/${id}`).then((r) => r.data),
};
