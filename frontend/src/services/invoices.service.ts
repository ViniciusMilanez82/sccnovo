import { api } from './api';

export type InvoiceStatus = 'PENDENTE' | 'ENVIADA' | 'PAGA' | 'VENCIDA' | 'CANCELADA';

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  contract: {
    id: string;
    number: string;
    client: { id: string; name: string; document: string };
  };
}

export interface CreateInvoiceData {
  contractId: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export const invoicesService = {
  async list(params?: { contractId?: string; clientId?: string; status?: InvoiceStatus; page?: number }) {
    const response = await api.get('/invoices', { params });
    return response.data;
  },

  async getById(id: string): Promise<Invoice> {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  },

  async create(data: CreateInvoiceData): Promise<Invoice> {
    const response = await api.post('/invoices', data);
    return response.data.data;
  },

  async markAsSent(id: string): Promise<Invoice> {
    const response = await api.patch(`/invoices/${id}/send`);
    return response.data.data;
  },

  async cancel(id: string): Promise<Invoice> {
    const response = await api.patch(`/invoices/${id}/cancel`);
    return response.data.data;
  },
};
