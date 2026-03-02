import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateInvoiceInput {
  contractId: string;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
}

export interface ListInvoicesQuery {
  contractId?: string;
  clientId?: string;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `FAT-${year}${month}-` } },
  });
  return `FAT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
}

export const invoiceService = {
  async list(query: ListInvoicesQuery) {
    const { contractId, clientId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(contractId && { contractId }),
      ...(clientId && { contract: { clientId } }),
      ...(status && { status }),
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
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            client: true,
            items: { include: { product: true } },
          },
        },
      },
    });
    if (!invoice) throw new AppError('Fatura não encontrada.', 404);
    return invoice;
  },

  async generateFromContract(input: CreateInvoiceInput) {
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
      include: { items: true },
    });

    if (!contract) throw new AppError('Contrato não encontrado.', 404);
    if (contract.status !== 'ATIVO') {
      throw new AppError('Apenas contratos ativos podem gerar faturas.', 422);
    }

    // Calcular valor total do contrato
    const totalAmount = contract.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );

    const number = await generateInvoiceNumber();

    return prisma.invoice.create({
      data: {
        number,
        contractId: input.contractId,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        amount: totalAmount,
        status: InvoiceStatus.PENDENTE,
        notes: input.notes,
      },
      include: {
        contract: {
          select: {
            number: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
    });
  },

  async markAsSent(id: string) {
    const invoice = await this.getById(id);
    if (invoice.status !== InvoiceStatus.PENDENTE) {
      throw new AppError('Apenas faturas pendentes podem ser marcadas como enviadas.', 422);
    }
    return prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.ENVIADA },
    });
  },

  async cancel(id: string) {
    const invoice = await this.getById(id);
    if (([InvoiceStatus.PAGA, InvoiceStatus.CANCELADA] as InvoiceStatus[]).includes(invoice.status)) {
      throw new AppError('Esta fatura não pode ser cancelada.', 422);
    }
    return prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELADA },
    });
  },

  async checkOverdue() {
    const today = new Date();
    const result = await prisma.invoice.updateMany({
      where: {
        status: { in: [InvoiceStatus.PENDENTE, InvoiceStatus.ENVIADA] },
        dueDate: { lt: today },
      },
      data: { status: InvoiceStatus.VENCIDA },
    });
    return { updated: result.count };
  },
};
