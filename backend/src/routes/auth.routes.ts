import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Autentica um usuário e retorna um token JWT.
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Informe um e-mail válido.'),
    body('password').notEmpty().withMessage('A senha é obrigatória.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.active) {
        return next(new AppError('Email ou senha inválidos.', 401));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(new AppError('Email ou senha inválidos.', 401));
      }

      const secret = process.env.JWT_SECRET as string;
      const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        secret,
        { expiresIn }
      );

      res.status(200).json({
        status: 'success',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as authRouter };
