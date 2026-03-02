import { PrismaClient, ContractStatus, ProposalStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateContractInput {
  clientId: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  proposalId?: string;
}

export interface ListContractsQuery {
  clientId?: string;
  status?: ContractStatus;
  page?: number;
  limit?: number;
}

async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.contract.count({
    where: { number: { startsWith: `CONT-${year}-` } },
  });
  return `CONT-${year}-${String(count + 1).padStart(4, '0')}`;
}

export const contractService = {
  async list(query: ListContractsQuery) {
    const { clientId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(clientId && { clientId }),
      ...(status && { status }),
    };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, document: true } },
          user: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, code: true, description: true } } } },
          _count: { select: { invoices: true } },
        },
      }),
      prisma.contract.count({ where }),
    ]);

    return {
      data: contracts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, document: true, email: true, phone: true } },
        user: { select: { id: true, name: true } },
        items: { include: { product: true } },
        invoices: { orderBy: { issueDate: 'desc' }, take: 5 },
      },
    });
    if (!contract) throw new AppError('Contrato não encontrado.', 404);
    return contract;
  },

  async createFromProposal(proposalId: string, userId: string, startDate: Date, endDate?: Date) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { items: true },
    });

    if (!proposal) throw new AppError('Proposta não encontrada.', 404);
    if (proposal.status !== ProposalStatus.APROVADA) {
      throw new AppError('Apenas propostas aprovadas podem ser convertidas em contrato.', 422);
    }

    // Verificar se já existe contrato vinculado a esta proposta
    const existingContract = await prisma.contract.findUnique({
      where: { proposalId },
    });
    if (existingContract) {
      throw new AppError('Esta proposta já foi convertida em contrato.', 409);
    }

    const number = await generateContractNumber();

    // Criar contrato e marcar proposta como convertida em uma transação
    const [contract] = await prisma.$transaction([
      prisma.contract.create({
        data: {
          number,
          proposalId,
          clientId: proposal.clientId,
          userId,
          startDate,
          endDate,
          status: ContractStatus.ATIVO,
          items: {
            create: proposal.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          client: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, code: true, description: true } } } },
        },
      }),
      prisma.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.CONVERTIDA },
      }),
    ]);

    return contract;
  },

  async create(input: CreateContractInput) {
    if (!input.items || input.items.length === 0) {
      throw new AppError('O contrato deve ter pelo menos um item.', 400);
    }

    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw new AppError('Cliente não encontrado.', 404);

    const number = await generateContractNumber();

    return prisma.contract.create({
      data: {
        number,
        clientId: input.clientId,
        userId: input.userId,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
        status: ContractStatus.ATIVO,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
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

  async updateStatus(id: string, status: ContractStatus) {
    await this.getById(id);

    const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
      ATIVO: [ContractStatus.SUSPENSO, ContractStatus.ENCERRADO, ContractStatus.CANCELADO],
      SUSPENSO: [ContractStatus.ATIVO, ContractStatus.ENCERRADO, ContractStatus.CANCELADO],
      ENCERRADO: [],
      CANCELADO: [],
    };

    const current = await prisma.contract.findUnique({ where: { id }, select: { status: true } });
    if (!current || !allowedTransitions[current.status].includes(status)) {
      throw new AppError(`Não é possível alterar o status de "${current?.status}" para "${status}".`, 422);
    }

    return prisma.contract.update({ where: { id }, data: { status } });
  },

  async calculateMonthlyValue(contractId: string) {
    const contract = await this.getById(contractId);
    const monthly = contract.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );
    return { monthly, items: contract.items.length };
  },
};
