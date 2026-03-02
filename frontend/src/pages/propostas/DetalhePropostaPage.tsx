import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';
import { proposalsService, ProposalStatus } from '../../services/proposals.service';

const statusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  RASCUNHO: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
  APROVADA: { label: 'Aprovada', color: 'bg-green-100 text-green-800' },
  REPROVADA: { label: 'Reprovada', color: 'bg-red-100 text-red-800' },
  CONVERTIDA: { label: 'Convertida', color: 'bg-blue-100 text-blue-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function DetalhePropostaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: proposal, isLoading, isError } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => proposalsService.getById(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ProposalStatus) => proposalsService.updateStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-red-500">
        <AlertCircle size={40} className="mx-auto mb-3" />
        <p>Proposta não encontrada.</p>
        <button onClick={() => navigate('/propostas')} className="mt-4 text-sm text-[#00529B] underline">
          Voltar para propostas
        </button>
      </div>
    );
  }

  const cfg = statusConfig[proposal.status];
  const totalBruto = proposal.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * item.periodDays,
    0
  );
  const totalLiquido = totalBruto * (1 - (proposal.discount || 0) / 100);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/propostas')} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">Proposta {proposal.number}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Criada em {formatDate(proposal.createdAt)} por {proposal.user.name}
          </p>
        </div>

        {/* Ações de status */}
        {proposal.status === 'RASCUNHO' && (
          <button
            onClick={() => statusMutation.mutate('AGUARDANDO_APROVACAO')}
            disabled={statusMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 disabled:opacity-60"
          >
            <FileText size={16} /> Enviar para Aprovação
          </button>
        )}
        {proposal.status === 'AGUARDANDO_APROVACAO' && (
          <div className="flex gap-2">
            <button
              onClick={() => statusMutation.mutate('APROVADA')}
              disabled={statusMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle size={16} /> Aprovar
            </button>
            <button
              onClick={() => statusMutation.mutate('REPROVADA')}
              disabled={statusMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              <XCircle size={16} /> Reprovar
            </button>
          </div>
        )}
        {proposal.status === 'APROVADA' && (
          <button
            onClick={() => navigate(`/contratos?fromProposal=${proposal.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00529B] text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <FileText size={16} /> Converter em Contrato
          </button>
        )}
      </div>

      {/* Dados do cliente */}
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Cliente</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nome:</span>{' '}
            <span className="font-medium text-gray-800">{proposal.client.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Documento:</span>{' '}
            <span className="font-medium text-gray-800">{proposal.client.document}</span>
          </div>
          {proposal.validUntil && (
            <div>
              <span className="text-gray-500">Válida até:</span>{' '}
              <span className="font-medium text-gray-800">{formatDate(proposal.validUntil)}</span>
            </div>
          )}
        </div>
        {proposal.notes && (
          <div className="mt-3 pt-3 border-t text-sm">
            <span className="text-gray-500">Observações:</span>{' '}
            <span className="text-gray-700">{proposal.notes}</span>
          </div>
        )}
      </div>

      {/* Itens */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
        <div className="px-6 py-4 border-b">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Itens da Proposta</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Qtd</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Preço Unit.</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Período</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {proposal.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500 mr-2">{item.product.code}</span>
                  <span className="text-gray-800">{item.product.description}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 text-center text-gray-700">{item.periodDays} dias</td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">
                  {formatCurrency(item.quantity * item.unitPrice * item.periodDays)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totais */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <div className="text-sm space-y-1 text-right">
            <div className="text-gray-600">
              Total bruto: <span className="font-medium text-gray-800">{formatCurrency(totalBruto)}</span>
            </div>
            {proposal.discount > 0 && (
              <div className="text-gray-500">
                Desconto ({proposal.discount}%):{' '}
                <span className="text-red-600">
                  -{formatCurrency((totalBruto * proposal.discount) / 100)}
                </span>
              </div>
            )}
            <div className="text-base font-bold text-[#00529B]">
              Total líquido: {formatCurrency(totalLiquido)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
