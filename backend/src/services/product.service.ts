import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateProductInput {
  code: string;
  description: string;
  unitPrice: number;
}

export interface UpdateProductInput {
  description?: string;
  unitPrice?: number;
  active?: boolean;
}

export interface ListProductsQuery {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export const productService = {
  async list(query: ListProductsQuery) {
    const { search, active, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { description: 'asc' } }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Produto não encontrado.', 404);
    return product;
  },

  async create(input: CreateProductInput) {
    const existing = await prisma.product.findUnique({ where: { code: input.code } });
    if (existing) throw new AppError('Já existe um produto com este código.', 409);

    return prisma.product.create({ data: input });
  },

  async update(id: string, input: UpdateProductInput) {
    await this.getById(id);
    return prisma.product.update({ where: { id }, data: input });
  },
};
