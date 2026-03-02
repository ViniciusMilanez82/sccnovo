import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

const validateUser = [
  body('name').trim().notEmpty().withMessage('O nome é obrigatório.'),
  body('email').isEmail().withMessage('Informe um e-mail válido.'),
  body('password').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
];

/**
 * GET /api/users
 * Lista todos os usuários. Apenas ADMIN e GERENTE.
 */
router.get('/', authorize(UserRole.ADMIN, UserRole.GERENTE), async (_req, res, next) => {
  try {
    const users = await authService.listUsers();
    res.json({ status: 'success', data: users });
  } catch (err) { next(err); }
});

/**
 * POST /api/users
 * Cria um novo usuário. Apenas ADMIN.
 */
router.post('/', authorize(UserRole.ADMIN), validateUser, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) { next(err); }
});

/**
 * GET /api/users/:id
 * Retorna um usuário. ADMIN vê qualquer um; outros só veem a si mesmos.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (req.user?.role !== UserRole.ADMIN && req.user?.userId !== id) {
    return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
  }
  try {
    const user = await authService.getUserById(id);
    res.json({ status: 'success', data: user });
  } catch (err) { next(err); }
});

/**
 * PUT /api/users/:id
 * Atualiza um usuário. ADMIN pode atualizar qualquer um; outros só a si mesmos.
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (req.user?.role !== UserRole.ADMIN && req.user?.userId !== id) {
    return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
  }
  if (req.body.role && req.user?.role !== UserRole.ADMIN) {
    return next(new AppError('Apenas administradores podem alterar o perfil de acesso.', 403));
  }
  try {
    const user = await authService.updateUser(id, req.body);
    res.json({ status: 'success', data: user });
  } catch (err) { next(err); }
});

/**
 * PATCH /api/users/:id/password
 * Altera a senha do próprio usuário.
 */
router.patch('/:id/password',
  [
    body('currentPassword').notEmpty().withMessage('A senha atual é obrigatória.'),
    body('newPassword').isLength({ min: 8 }).withMessage('A nova senha deve ter no mínimo 8 caracteres.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

    if (req.user?.userId !== req.params.id) {
      return next(new AppError('Você só pode alterar sua própria senha.', 403));
    }
    try {
      await authService.changePassword(req.params.id, req.body.currentPassword, req.body.newPassword);
      res.json({ status: 'success', message: 'Senha alterada com sucesso.' });
    } catch (err) { next(err); }
  }
);

export { router as userRouter };
