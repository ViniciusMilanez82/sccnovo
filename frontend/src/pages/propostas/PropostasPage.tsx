import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { proposalsService, Proposal, ProposalStatus } from '../../services/proposals.service';

const statusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  RASCUNHO: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
  APROVADA: { label: 'Aprovada', color: 'bg-green-100 text-green-800' },
  REPROVADA: { label: 'Reprovada', color: 'bg-red-100 text-red-800' },
  CONVERTIDA: { label: 'Convertida', color: 'bg-blue-100 text-blue-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
};

function StatusBadge({ status }: { status: ProposalStatus }) {
  const cfg = statusConfig[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function PropostasPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['proposals', statusFilter, page],
    queryFn: () => proposalsService.list({
      status: statusFilter || undefined,
      page,
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProposalStatus }) =>
      proposalsService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals'] }),
  });

  const handleApprove = (id: string) => statusMutation.mutate({ id, status: 'APROVADA' });
  const handleReject = (id: string) => statusMutation.mutate({ id, status: 'REPROVADA' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Propostas Comerciais</h2>
        <button
          onClick={() => navigate('/propostas/nova')}
          className="flex items-center gap-2 bg-[#00529B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Nova Proposta
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as ProposalStatus | ''); setPage(1); }}
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
          <div className="p-12 text-center text-red-500"><AlertCircle size={32} className="mx-auto mb-2" /><p>Erro ao carregar propostas.</p></div>
        ) : data?.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhuma proposta encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Número</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((p: Proposal) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#00529B]">{p.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.client.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/propostas/${p.id}`)}
                        className="text-gray-400 hover:text-[#00529B]"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      {p.status === 'AGUARDANDO_APROVACAO' && (
                        <>
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="text-gray-400 hover:text-green-600"
                            title="Aprovar"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Reprovar"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
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
            <span>{data.meta.total} propostas</span>
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
