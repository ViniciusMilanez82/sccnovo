import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Users, ClipboardList, FileText,
} from 'lucide-react';
import { api } from '../services/api';

type InvoiceStatus = 'PENDENTE' | 'ENVIADA' | 'PAGA' | 'VENCIDA' | 'CANCELADA';

interface KpiData {
  kpis: {
    activeContracts: number;
    totalClients: number;
    overdueInvoices: { count: number; amount: number };
    pendingInvoices: { count: number; amount: number };
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
    newClientsThisMonth: number;
  };
  recentInvoices: {
    id: string;
    number: string;
    clientName: string;
    amount: number;
    status: InvoiceStatus;
    dueDate: string;
  }[];
  contractsByStatus: { status: string; count: number }[];
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('pt-BR'); }

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; color: string }> = {
  PENDENTE: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  ENVIADA: { label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
  PAGA: { label: 'Paga', color: 'bg-green-100 text-green-800' },
  VENCIDA: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-400' },
};

function KpiCard({
  title, value, subtitle, icon: Icon, color, trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-3/4" />
    </div>
  );
}

export function DashboardPage() {
  const { data: kpiData, isLoading: kpiLoading } = useQuery<KpiData>({
    queryKey: ['dashboard-kpis'],
    queryFn: () => api.get('/dashboard/kpis').then(r => r.data.data),
    refetchInterval: 60000,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<{ month: string; revenue: number }[]>({
    queryKey: ['dashboard-chart'],
    queryFn: () => api.get('/dashboard/revenue-chart?months=6').then(r => r.data.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-400">Atualizado automaticamente a cada minuto</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiLoading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : kpiData ? (
          <>
            <KpiCard
              title="Contratos Ativos"
              value={String(kpiData.kpis.activeContracts)}
              subtitle="Locações em andamento"
              icon={ClipboardList}
              color="bg-[#00529B]"
            />
            <KpiCard
              title="Clientes Ativos"
              value={String(kpiData.kpis.totalClients)}
              subtitle={`+${kpiData.kpis.newClientsThisMonth} este mês`}
              icon={Users}
              color="bg-indigo-500"
            />
            <KpiCard
              title="Receita do Mês"
              value={formatCurrency(kpiData.kpis.revenueThisMonth)}
              subtitle={`Mês anterior: ${formatCurrency(kpiData.kpis.revenueLastMonth)}`}
              icon={TrendingUp}
              color="bg-green-500"
              trend={{ value: kpiData.kpis.revenueGrowth, label: 'vs. mês anterior' }}
            />
            <KpiCard
              title="Faturas Vencidas"
              value={formatCurrency(kpiData.kpis.overdueInvoices.amount)}
              subtitle={`${kpiData.kpis.overdueInvoices.count} faturas em atraso`}
              icon={AlertTriangle}
              color="bg-red-500"
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de receita */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Receita Mensal (últimos 6 meses)</h3>
          {chartLoading ? (
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          ) : chartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelStyle={{ fontWeight: 600 }} />
                <Bar dataKey="revenue" fill="#00529B" radius={[4, 4, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Contratos por status */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Contratos por Status</h3>
          {kpiLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : kpiData ? (
            <div className="space-y-3">
              {kpiData.contractsByStatus.map((s) => {
                const colors: Record<string, string> = {
                  ATIVO: 'bg-green-500', SUSPENSO: 'bg-yellow-500',
                  ENCERRADO: 'bg-gray-400', CANCELADO: 'bg-red-400',
                };
                const labels: Record<string, string> = {
                  ATIVO: 'Ativo', SUSPENSO: 'Suspenso', ENCERRADO: 'Encerrado', CANCELADO: 'Cancelado',
                };
                const total = kpiData.contractsByStatus.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{labels[s.status] || s.status}</span>
                      <span className="font-medium text-gray-800">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[s.status] || 'bg-gray-400'} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {kpiData.contractsByStatus.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum contrato ainda.</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Faturas recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-base font-semibold text-gray-800">Faturas Recentes</h3>
          <a href="/faturamento" className="text-sm text-[#00529B] hover:underline">Ver todas</a>
        </div>
        {kpiLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : kpiData?.recentInvoices.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">Nenhuma fatura emitida ainda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Número</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Vencimento</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Valor</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kpiData?.recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs font-medium text-[#00529B]">{inv.number}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{inv.clientName}</td>
                  <td className={`px-5 py-3 ${inv.status === 'VENCIDA' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-800">{formatCurrency(inv.amount)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${invoiceStatusConfig[inv.status].color}`}>
                      {invoiceStatusConfig[inv.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
