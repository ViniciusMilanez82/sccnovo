import { api } from './api';

export type ContractStatus = 'ATIVO' | 'ENCERRADO' | 'CANCELADO' | 'SUSPENSO';

export interface ContractItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; code: string; description: string };
}

export interface Contract {
  id: string;
  number: string;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  client: { id: string; name: string; document: string };
  user: { id: string; name: string };
  items: ContractItem[];
  _count?: { invoices: number };
}

export const contractsService = {
  async list(params?: { clientId?: string; status?: ContractStatus; page?: number }) {
    const response = await api.get('/contracts', { params });
    return response.data;
  },

  async getById(id: string): Promise<Contract> {
    const response = await api.get(`/contracts/${id}`);
    return response.data.data;
  },

  async createFromProposal(proposalId: string, startDate: string, endDate?: string) {
    const response = await api.post(`/contracts/from-proposal/${proposalId}`, { startDate, endDate });
    return response.data.data;
  },

  async updateStatus(id: string, status: ContractStatus) {
    const response = await api.patch(`/contracts/${id}/status`, { status });
    return response.data.data;
  },

  async getMonthlyValue(id: string) {
    const response = await api.get(`/contracts/${id}/monthly-value`);
    return response.data.data;
  },
};
