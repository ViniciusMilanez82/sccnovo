import { api } from './api';

export interface Product {
  id: string;
  code: string;
  description: string;
  unitPrice: number;
  active: boolean;
  createdAt: string;
}

export interface CreateProductData {
  code: string;
  description: string;
  unitPrice: number;
}

export const productsService = {
  async list(params?: { search?: string; active?: boolean; page?: number; limit?: number }) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  async create(data: CreateProductData): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateProductData & { active: boolean }>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data;
  },
};
