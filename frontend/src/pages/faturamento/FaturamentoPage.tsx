import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertCircle, FileText, Send, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoicesService, Invoice, InvoiceStatus, CreateInvoiceData } from '../../services/invoices.service';

const statusConfig: Record<InvoiceStatus, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  ENVIADA: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  PAGA: { label: 'Paga', color: 'bg-green-100 text-green-800' },
  VENCIDA: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-400' },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = statusConfig[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function formatDate(d: string) { return new Date(d).toLocaleDateString('pt-BR'); }
function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

const invoiceSchema = z.object({
  contractId: z.string().min(1, 'O ID do contrato é obrigatório.'),
  issueDate: z.string().min(1, 'A data de emissão é obrigatória.'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória.'),
  notes: z.string().optional(),
});
type InvoiceFormData = z.infer<typeof invoiceSchema>;

function NovaFaturaModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateInvoiceData) => invoicesService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['invoices'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Gerar Nova Fatura</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {mutation.isError && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            <AlertCircle size={16} />
            <span>{(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao gerar fatura.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID do Contrato</label>
            <input {...register('contractId')} placeholder="UUID do contrato" className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] font-mono ${errors.contractId ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.contractId && <p className="text-red-500 text-xs mt-1">{errors.contractId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
              <input type="date" {...register('issueDate')} className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.issueDate ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
              <input type="date" {...register('dueDate')} className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
            <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-[#00529B] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Gerar Fatura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FaturamentoPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invoices', statusFilter, page],
    queryFn: () => invoicesService.list({ status: statusFilter || undefined, page }),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => invoicesService.markAsSent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => invoicesService.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Faturamento</h2>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-[#00529B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Gerar Fatura
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as InvoiceStatus | ''); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]">
          <option value="">Todos os status</option>
          {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500"><AlertCircle size={32} className="mx-auto mb-2" /><p>Erro ao carregar faturas.</p></div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500"><FileText size={40} className="mx-auto mb-3 text-gray-300" /><p className="font-medium">Nenhuma fatura encontrada.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Número</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vencimento</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((inv: Invoice) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#00529B]">{inv.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{inv.contract.client.name}</td>
                  <td className={`px-4 py-3 ${inv.status === 'VENCIDA' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(Number(inv.amount))}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status === 'PENDENTE' && (
                        <button onClick={() => sendMutation.mutate(inv.id)} className="text-gray-400 hover:text-blue-600" title="Marcar como enviada"><Send size={15} /></button>
                      )}
                      {!['PAGA', 'CANCELADA'].includes(inv.status) && (
                        <button onClick={() => cancelMutation.mutate(inv.id)} className="text-gray-400 hover:text-red-600" title="Cancelar fatura"><X size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>{data.meta.total} faturas</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="px-3 py-1">Página {page} de {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="px-3 py-1 border rounded disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && <NovaFaturaModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
