import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { proposalService } from '../services/proposal.service';
import { AppError } from '../middleware/errorHandler';
import { ProposalStatus, UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await proposalService.list({
      clientId: req.query.clientId as string,
      status: req.query.status as ProposalStatus,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    res.json({ status: 'success', ...result });
  } catch (err) { next(err); }
});

router.post('/',
  [
    body('clientId').notEmpty().withMessage('O cliente é obrigatório.'),
    body('items').isArray({ min: 1 }).withMessage('A proposta deve ter pelo menos um item.'),
    body('items.*.productId').notEmpty().withMessage('O produto do item é obrigatório.'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('A quantidade deve ser maior que zero.'),
    body('items.*.unitPrice').isFloat({ min: 0.01 }).withMessage('O preço unitário deve ser maior que zero.'),
    body('items.*.periodDays').isInt({ min: 1 }).withMessage('O período deve ser maior que zero.'),
    body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('O desconto deve ser entre 0 e 100%.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const proposal = await proposalService.create({ ...req.body, userId: req.user!.userId });
      res.status(201).json({ status: 'success', data: proposal });
    } catch (err) { next(err); }
  }
);

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const proposal = await proposalService.getById(req.params.id);
    res.json({ status: 'success', data: proposal });
  } catch (err) { next(err); }
});

router.get('/:id/total', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await proposalService.calculateTotal(req.params.id);
    res.json({ status: 'success', data: total });
  } catch (err) { next(err); }
});

router.patch('/:id/status',
  authorize(UserRole.ADMIN, UserRole.GERENTE, UserRole.VENDEDOR),
  [body('status').isIn(Object.values(ProposalStatus)).withMessage('Status inválido.')],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const proposal = await proposalService.updateStatus(req.params.id, req.body.status, req.user!.userId);
      res.json({ status: 'success', data: proposal });
    } catch (err) { next(err); }
  }
);

export { router as proposalRouter };
