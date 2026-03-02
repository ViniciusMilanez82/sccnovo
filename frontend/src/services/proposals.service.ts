import { api } from './api';

export type ProposalStatus = 'RASCUNHO' | 'AGUARDANDO_APROVACAO' | 'APROVADA' | 'REPROVADA' | 'CONVERTIDA' | 'CANCELADA';

export interface ProposalItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  periodDays: number;
  product: { id: string; code: string; description: string };
}

export interface Proposal {
  id: string;
  number: string;
  status: ProposalStatus;
  discount: number;
  notes?: string;
  validUntil?: string;
  createdAt: string;
  client: { id: string; name: string; document: string };
  user: { id: string; name: string };
  items: ProposalItem[];
}

export interface CreateProposalData {
  clientId: string;
  discount?: number;
  notes?: string;
  validUntil?: string;
  items: { productId: string; quantity: number; unitPrice: number; periodDays: number }[];
}

export const proposalsService = {
  async list(params?: { clientId?: string; status?: ProposalStatus; page?: number }) {
    const response = await api.get('/proposals', { params });
    return response.data;
  },

  async getById(id: string): Promise<Proposal> {
    const response = await api.get(`/proposals/${id}`);
    return response.data.data;
  },

  async create(data: CreateProposalData): Promise<Proposal> {
    const response = await api.post('/proposals', data);
    return response.data.data;
  },

  async updateStatus(id: string, status: ProposalStatus): Promise<Proposal> {
    const response = await api.patch(`/proposals/${id}/status`, { status });
    return response.data.data;
  },

  async getTotal(id: string) {
    const response = await api.get(`/proposals/${id}/total`);
    return response.data.data;
  },
};
