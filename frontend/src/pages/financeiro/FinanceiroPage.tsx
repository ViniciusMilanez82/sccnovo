import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, AlertCircle, CheckCircle, Clock, X, Loader2, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api';
import { Invoice, InvoiceStatus } from '../../services/invoices.service';

type PaymentMethod = 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'DINHEIRO' | 'CARTAO';

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  paidAmount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
  paymentDate: z.string().min(1, 'A data é obrigatória.'),
  paymentMethod: z.enum(['BOLETO', 'PIX', 'TRANSFERENCIA', 'DINHEIRO', 'CARTAO']),
  notes: z.string().optional(),
});
type PaymentFormData = z.infer<typeof paymentSchema>;

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('pt-BR'); }

const statusConfig: Record<InvoiceStatus, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  ENVIADA: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  PAGA: { label: 'Paga', color: 'bg-green-100 text-green-800' },
  VENCIDA: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-400' },
};

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
}

function PaymentModal({ invoice, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: invoice.id,
      paidAmount: Number(invoice.amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'PIX',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentFormData) => api.post('/receivables/payment', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['receivables-summary'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Registrar Pagamento</h3>
            <p className="text-sm text-gray-500 mt-0.5">{invoice.number} — {invoice.contract.client.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {mutation.isError && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            <AlertCircle size={16} />
            <span>{(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao registrar pagamento.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <input type="hidden" {...register('invoiceId')} />

          <div className="bg-blue-50 rounded-md p-3 text-sm">
            <span className="text-gray-600">Valor da fatura: </span>
            <span className="font-bold text-[#00529B]">{formatCurrency(Number(invoice.amount))}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago</label>
              <input type="number" step="0.01" {...register('paidAmount')} className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] ${errors.paidAmount ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.paidAmount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento</label>
              <input type="date" {...register('paymentDate')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select {...register('paymentMethod')} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]">
              <option value="PIX">PIX</option>
              <option value="BOLETO">Boleto</option>
              <option value="TRANSFERENCIA">Transferência</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO">Cartão</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
            <input {...register('notes')} placeholder="Ex: Comprovante #12345" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FinanceiroPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('VENCIDA');
  const [page, setPage] = useState(1);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  const { data: summary } = useQuery({
    queryKey: ['receivables-summary'],
    queryFn: () => api.get('/receivables/summary').then(r => r.data.data),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['receivables', statusFilter, page],
    queryFn: () => api.get('/receivables', { params: { status: statusFilter || undefined, page } }).then(r => r.data),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Financeiro — Recebíveis</h2>

      {/* Cards de resumo */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Clock size={14} /> A Receber</div>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.pending.amount)}</p>
            <p className="text-xs text-gray-400">{summary.pending.count} faturas</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-red-500 text-sm mb-1"><AlertCircle size={14} /> Vencidas</div>
            <p className="text-xl font-bold text-red-600">{formatCurrency(summary.overdue.amount)}</p>
            <p className="text-xs text-gray-400">{summary.overdue.count} faturas</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-green-500 text-sm mb-1"><CheckCircle size={14} /> Recebido</div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.paid.amount)}</p>
            <p className="text-xs text-gray-400">{summary.paid.count} faturas</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-blue-500 text-sm mb-1"><TrendingUp size={14} /> Total Emitido</div>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.total.amount)}</p>
            <p className="text-xs text-gray-400">{summary.total.count} faturas</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as InvoiceStatus | ''); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]">
          <option value="">Todos</option>
          {Object.entries(statusConfig).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500"><AlertCircle size={32} className="mx-auto mb-2" /><p>Erro ao carregar recebíveis.</p></div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500"><DollarSign size={40} className="mx-auto mb-3 text-gray-300" /><p className="font-medium">Nenhum recebível encontrado.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fatura</th>
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
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[inv.status].color}`}>{statusConfig[inv.status].label}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!['PAGA', 'CANCELADA'].includes(inv.status) && (
                      <button onClick={() => setPayingInvoice(inv)} className="flex items-center gap-1 ml-auto text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        <DollarSign size={12} /> Baixar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>{data.meta.total} registros</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="px-3 py-1">Página {page} de {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="px-3 py-1 border rounded disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {payingInvoice && <PaymentModal invoice={payingInvoice} onClose={() => setPayingInvoice(null)} />}
    </div>
  );
}
