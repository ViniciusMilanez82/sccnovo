import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, AlertCircle, ClipboardList } from 'lucide-react';
import { contractsService, Contract, ContractStatus } from '../../services/contracts.service';

const statusConfig: Record<ContractStatus, { label: string; color: string }> = {
  ATIVO: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
  SUSPENSO: { label: 'Suspenso', color: 'bg-yellow-100 text-yellow-800' },
  ENCERRADO: { label: 'Encerrado', color: 'bg-gray-100 text-gray-600' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

function StatusBadge({ status }: { status: ContractStatus }) {
  const cfg = statusConfig[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function ContractMonthlyValue({ contractId }: { contractId: string }) {
  const { data } = useQuery({
    queryKey: ['contract-value', contractId],
    queryFn: () => contractsService.getMonthlyValue(contractId),
  });
  return <span>{data ? formatCurrency(data.monthly) : '—'}</span>;
}

export function ContratosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contracts', statusFilter, page],
    queryFn: () => contractsService.list({ status: statusFilter || undefined, page }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContractStatus }) =>
      contractsService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Contratos de Locação</h2>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as ContractStatus | ''); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]"
        >
          <option value="">Todos os status</option>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500"><AlertCircle size={32} className="mx-auto mb-2" /><p>Erro ao carregar contratos.</p></div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum contrato encontrado.</p>
            <p className="text-sm mt-1">Converta uma proposta aprovada para criar um contrato.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Número</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Início</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Término</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Valor/mês</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((c: Contract) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#00529B]">{c.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.startDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{c.endDate ? formatDate(c.endDate) : 'Indeterminado'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    <ContractMonthlyValue contractId={c.id} />
                  </td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/contratos/${c.id}`)} className="text-gray-400 hover:text-[#00529B]" title="Ver detalhes">
                        <Eye size={16} />
                      </button>
                      {c.status === 'ATIVO' && (
                        <button
                          onClick={() => statusMutation.mutate({ id: c.id, status: 'ENCERRADO' })}
                          className="text-xs text-gray-400 hover:text-red-600 border border-gray-200 px-2 py-0.5 rounded"
                          title="Encerrar contrato"
                        >
                          Encerrar
                        </button>
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
            <span>{data.meta.total} contratos</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="px-3 py-1">Página {page} de {data.meta.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="px-3 py-1 border rounded disabled:opacity-40">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
