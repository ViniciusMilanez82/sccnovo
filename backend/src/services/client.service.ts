import { PrismaClient, PersonType, ClientStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateClientInput {
  personType: PersonType;
  name: string;
  document: string;
  stateId?: string;
  email?: string;
  phone?: string;
  addresses?: CreateAddressInput[];
}

export interface CreateAddressInput {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isMain?: boolean;
}

export interface UpdateClientInput {
  name?: string;
  stateId?: string;
  email?: string;
  phone?: string;
  status?: ClientStatus;
}

export interface ListClientsQuery {
  search?: string;
  status?: ClientStatus;
  page?: number;
  limit?: number;
}

export const clientService = {
  async list(query: ListClientsQuery) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { document: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { addresses: { where: { isMain: true }, take: 1 } },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { addresses: true },
    });
    if (!client) throw new AppError('Cliente não encontrado.', 404);
    return client;
  },

  async create(input: CreateClientInput) {
    // Validar documento único
    const existing = await prisma.client.findUnique({ where: { document: input.document } });
    if (existing) {
      throw new AppError(
        input.personType === PersonType.PJ ? 'CNPJ já cadastrado.' : 'CPF já cadastrado.',
        409
      );
    }

    const { addresses, ...clientData } = input;

    return prisma.client.create({
      data: {
        ...clientData,
        ...(addresses && addresses.length > 0 && {
          addresses: {
            create: addresses.map((addr, idx) => ({
              ...addr,
              isMain: addr.isMain ?? idx === 0,
            })),
          },
        }),
      },
      include: { addresses: true },
    });
  },

  async update(id: string, input: UpdateClientInput) {
    await this.getById(id); // valida existência
    return prisma.client.update({
      where: { id },
      data: input,
      include: { addresses: { where: { isMain: true }, take: 1 } },
    });
  },

  async addAddress(clientId: string, input: CreateAddressInput) {
    await this.getById(clientId);

    // Se o novo endereço for principal, remove o principal atual
    if (input.isMain) {
      await prisma.address.updateMany({
        where: { clientId, isMain: true },
        data: { isMain: false },
      });
    }

    return prisma.address.create({ data: { ...input, clientId } });
  },

  async updateAddress(clientId: string, addressId: string, input: Partial<CreateAddressInput>) {
    const address = await prisma.address.findFirst({ where: { id: addressId, clientId } });
    if (!address) throw new AppError('Endereço não encontrado.', 404);

    if (input.isMain) {
      await prisma.address.updateMany({
        where: { clientId, isMain: true, NOT: { id: addressId } },
        data: { isMain: false },
      });
    }

    return prisma.address.update({ where: { id: addressId }, data: input });
  },

  async deleteAddress(clientId: string, addressId: string) {
    const address = await prisma.address.findFirst({ where: { id: addressId, clientId } });
    if (!address) throw new AppError('Endereço não encontrado.', 404);
    if (address.isMain) throw new AppError('Não é possível remover o endereço principal.', 400);
    await prisma.address.delete({ where: { id: addressId } });
  },
};
