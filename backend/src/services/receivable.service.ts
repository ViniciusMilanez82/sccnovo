import { PrismaClient, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface PaymentInput {
  invoiceId: string;
  paidAmount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ReceivablesQuery {
  status?: InvoiceStatus;
  clientId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  page?: number;
  limit?: number;
}

export const receivableService = {
  async listReceivables(query: ReceivablesQuery) {
    const { status, clientId, dueDateFrom, dueDateTo, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      ...(status && { status }),
      ...(clientId && { contract: { clientId } }),
      ...(dueDateFrom || dueDateTo
        ? {
            dueDate: {
              ...(dueDateFrom && { gte: dueDateFrom }),
              ...(dueDateTo && { lte: dueDateTo }),
            },
          }
        : {}),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          contract: {
            select: {
              id: true,
              number: true,
              client: { select: { id: true, name: true, document: true } },
            },
          },
          payments: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async registerPayment(input: PaymentInput) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { payments: true },
    });

    if (!invoice) throw new AppError('Fatura não encontrada.', 404);
    if (invoice.status === InvoiceStatus.PAGA) {
      throw new AppError('Esta fatura já foi paga.', 409);
    }
    if (invoice.status === InvoiceStatus.CANCELADA) {
      throw new AppError('Não é possível registrar pagamento em fatura cancelada.', 422);
    }

    // Calcular total já pago
    const totalPaid = invoice.payments.reduce(
      (sum: number, p: { amount: unknown }) => sum + Number(p.amount),
      0
    );
    const remaining = Number(invoice.amount) - totalPaid;

    if (input.paidAmount > remaining + 0.01) {
      throw new AppError(
        `O valor pago (${input.paidAmount}) excede o saldo devedor (${remaining.toFixed(2)}).`,
        422
      );
    }

    const newTotalPaid = totalPaid + input.paidAmount;
    const isFullyPaid = newTotalPaid >= Number(invoice.amount) - 0.01;

    // Registrar pagamento e atualizar status em transação
    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          invoiceId: input.invoiceId,
          amount: input.paidAmount,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
        },
      }),
      prisma.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: isFullyPaid ? InvoiceStatus.PAGA : invoice.status,
          paidAt: isFullyPaid ? input.paymentDate : null,
        },
      }),
    ]);

    return {
      payment,
      fullyPaid: isFullyPaid,
      totalPaid: newTotalPaid,
      remaining: isFullyPaid ? 0 : Number(invoice.amount) - newTotalPaid,
    };
  },

  async getSummary(clientId?: string) {
    const where = clientId ? { contract: { clientId } } : {};

    const [pending, overdue, paid, total] = await Promise.all([
      prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PENDENTE },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.VENCIDA },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PAGA },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { ...where, status: { not: InvoiceStatus.CANCELADA } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      pending: { amount: Number(pending._sum.amount || 0), count: pending._count },
      overdue: { amount: Number(overdue._sum.amount || 0), count: overdue._count },
      paid: { amount: Number(paid._sum.amount || 0), count: paid._count },
      total: { amount: Number(total._sum.amount || 0), count: total._count },
    };
  },
};
