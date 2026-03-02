import { api } from './api';

export type PersonType = 'PF' | 'PJ';
export type ClientStatus = 'ATIVO' | 'INATIVO' | 'INADIMPLENTE';

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isMain: boolean;
}

export interface Client {
  id: string;
  personType: PersonType;
  name: string;
  document: string;
  stateId?: string;
  email?: string;
  phone?: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
}

export interface CreateClientData {
  personType: PersonType;
  name: string;
  document: string;
  stateId?: string;
  email?: string;
  phone?: string;
  addresses?: Omit<Address, 'id'>[];
}

export interface ListClientsParams {
  search?: string;
  status?: ClientStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const clientsService = {
  async list(params?: ListClientsParams): Promise<PaginatedResponse<Client>> {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  },

  async create(data: CreateClientData): Promise<Client> {
    const response = await api.post('/clients', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<CreateClientData>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data);
    return response.data.data;
  },
};
