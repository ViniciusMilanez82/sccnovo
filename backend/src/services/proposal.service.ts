import { PrismaClient, ProposalStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface ProposalItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  periodDays: number;
}

export interface CreateProposalInput {
  clientId: string;
  userId: string;
  discount?: number;
  notes?: string;
  validUntil?: Date | string;
  items: ProposalItemInput[];
}

export interface ListProposalsQuery {
  clientId?: string;
  status?: ProposalStatus;
  page?: number;
  limit?: number;
}

async function generateProposalNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.proposal.count({
    where: { number: { startsWith: `PROP-${year}-` } },
  });
  return `PROP-${year}-${String(count + 1).padStart(4, '0')}`;
}

export const proposalService = {
  async list(query: ListProposalsQuery) {
    const { clientId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(clientId && { clientId }),
      ...(status && { status }),
    };

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, document: true } },
          user: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, code: true, description: true } } } },
        },
      }),
      prisma.proposal.count({ where }),
    ]);

    return {
      data: proposals,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, document: true, email: true, phone: true } },
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
      },
    });
    if (!proposal) throw new AppError('Proposta não encontrada.', 404);
    return proposal;
  },

  async create(input: CreateProposalInput) {
    if (!input.items || input.items.length === 0) {
      throw new AppError('A proposta deve ter pelo menos um item.', 400);
    }

    // Validar cliente
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw new AppError('Cliente não encontrado.', 404);
    if (client.status === 'INADIMPLENTE') throw new AppError('Não é possível criar proposta para cliente inadimplente.', 422);

    // Validar produtos
    for (const item of input.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new AppError(`Produto ${item.productId} não encontrado.`, 404);
      if (!product.active) throw new AppError(`Produto "${product.description}" está inativo.`, 422);
    }

    const number = await generateProposalNumber();

    // Converter validUntil para Date se vier como string ISO
    let validUntilDate: Date | undefined;
    if (input.validUntil) {
      validUntilDate = input.validUntil instanceof Date
        ? input.validUntil
        : new Date(input.validUntil);
      if (isNaN(validUntilDate.getTime())) validUntilDate = undefined;
    }

    return prisma.proposal.create({
      data: {
        number,
        clientId: input.clientId,
        userId: input.userId,
        discount: input.discount || 0,
        notes: input.notes,
        validUntil: validUntilDate,
        status: ProposalStatus.RASCUNHO,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            periodDays: item.periodDays,
          })),
        },
      },
      include: {
        client: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, code: true, description: true } } } },
      },
    });
  },

  async updateStatus(id: string, status: ProposalStatus, userId: string) {
    const proposal = await this.getById(id);

    // Regras de transição de status
    const allowedTransitions: Record<ProposalStatus, ProposalStatus[]> = {
      RASCUNHO: [ProposalStatus.AGUARDANDO_APROVACAO, ProposalStatus.CANCELADA],
      AGUARDANDO_APROVACAO: [ProposalStatus.APROVADA, ProposalStatus.REPROVADA, ProposalStatus.CANCELADA],
      APROVADA: [ProposalStatus.CONVERTIDA, ProposalStatus.CANCELADA],
      REPROVADA: [],
      CONVERTIDA: [],
      CANCELADA: [],
    };

    if (!allowedTransitions[proposal.status].includes(status)) {
      throw new AppError(
        `Não é possível alterar o status de "${proposal.status}" para "${status}".`,
        422
      );
    }

    return prisma.proposal.update({
      where: { id },
      data: { status },
    });
  },

  async calculateTotal(proposalId: string) {
    const proposal = await this.getById(proposalId);
    const subtotal = proposal.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );
    const discountAmount = subtotal * (Number(proposal.discount) / 100);
    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total, discount: Number(proposal.discount) };
  },
};
