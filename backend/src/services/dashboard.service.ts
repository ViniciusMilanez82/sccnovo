import { PrismaClient, ContractStatus, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const dashboardService = {
  async getKpis() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      activeContracts,
      totalClients,
      overdueInvoices,
      pendingInvoices,
      revenueThisMonth,
      revenueLastMonth,
      newClientsThisMonth,
      recentInvoices,
      topClients,
      contractsByStatus,
    ] = await Promise.all([
      // Contratos ativos
      prisma.contract.count({ where: { status: ContractStatus.ATIVO } }),

      // Total de clientes ativos
      prisma.client.count({ where: { status: 'ATIVO' } }),

      // Faturas vencidas
      prisma.invoice.aggregate({
        where: { status: InvoiceStatus.VENCIDA },
        _sum: { amount: true },
        _count: true,
      }),

      // Faturas pendentes
      prisma.invoice.aggregate({
        where: { status: { in: [InvoiceStatus.PENDENTE, InvoiceStatus.ENVIADA] } },
        _sum: { amount: true },
        _count: true,
      }),

      // Receita do mês atual (faturas pagas)
      prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.PAGA,
          paidAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // Receita do mês passado
      prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.PAGA,
          paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),

      // Novos clientes este mês
      prisma.client.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Últimas 5 faturas
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            select: { client: { select: { name: true } } },
          },
        },
      }),

      // Top 5 clientes por receita
      prisma.payment.groupBy({
        by: ['invoiceId'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),

      // Contratos por status
      prisma.contract.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const revenueThisMonthAmount = Number(revenueThisMonth._sum.amount || 0);
    const revenueLastMonthAmount = Number(revenueLastMonth._sum.amount || 0);
    const revenueGrowth = revenueLastMonthAmount > 0
      ? ((revenueThisMonthAmount - revenueLastMonthAmount) / revenueLastMonthAmount) * 100
      : 0;

    return {
      kpis: {
        activeContracts,
        totalClients,
        overdueInvoices: {
          count: overdueInvoices._count,
          amount: Number(overdueInvoices._sum.amount || 0),
        },
        pendingInvoices: {
          count: pendingInvoices._count,
          amount: Number(pendingInvoices._sum.amount || 0),
        },
        revenueThisMonth: revenueThisMonthAmount,
        revenueLastMonth: revenueLastMonthAmount,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        newClientsThisMonth,
      },
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        clientName: inv.contract.client.name,
        amount: Number(inv.amount),
        status: inv.status,
        dueDate: inv.dueDate,
      })),
      contractsByStatus: contractsByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  },

  async getRevenueChart(months = 6) {
    const data = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const revenue = await prisma.invoice.aggregate({
        where: {
          status: InvoiceStatus.PAGA,
          paidAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      data.push({
        month: start.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue: Number(revenue._sum.amount || 0),
      });
    }

    return data;
  },
};
