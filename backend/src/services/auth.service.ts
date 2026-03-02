import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthPayload } from '../middleware/auth';

const prisma = new PrismaClient();

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
}

export const authService = {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.active) {
      throw new AppError('Email ou senha inválidos.', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos.', 401);
    }

    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

    const payload: AuthPayload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async createUser(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('Já existe um usuário com este e-mail.', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role || UserRole.VENDEDOR,
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return user;
  },

  async listUsers() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    if (!user) throw new AppError('Usuário não encontrado.', 404);
    return user;
  },

  async updateUser(id: string, input: UpdateUserInput) {
    await this.getUserById(id); // valida existência

    if (input.email) {
      const existing = await prisma.user.findFirst({
        where: { email: input.email, NOT: { id } },
      });
      if (existing) throw new AppError('Já existe um usuário com este e-mail.', 409);
    }

    return prisma.user.update({
      where: { id },
      data: input,
      select: { id: true, name: true, email: true, role: true, active: true, updatedAt: true },
    });
  },

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError('Senha atual incorreta.', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  },
};
