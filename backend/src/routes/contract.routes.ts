import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { contractService } from '../services/contract.service';
import { AppError } from '../middleware/errorHandler';
import { ContractStatus, UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contractService.list({
      clientId: req.query.clientId as string,
      status: req.query.status as ContractStatus,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    res.json({ status: 'success', ...result });
  } catch (err) { next(err); }
});

router.post('/',
  authorize(UserRole.ADMIN, UserRole.GERENTE),
  [
    body('clientId').notEmpty().withMessage('O cliente é obrigatório.'),
    body('startDate').isISO8601().withMessage('A data de início é obrigatória e deve ser válida.'),
    body('items').isArray({ min: 1 }).withMessage('O contrato deve ter pelo menos um item.'),
    body('items.*.productId').notEmpty().withMessage('O produto do item é obrigatório.'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('A quantidade deve ser maior que zero.'),
    body('items.*.unitPrice').isFloat({ min: 0.01 }).withMessage('O preço unitário deve ser maior que zero.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const contract = await contractService.create({
        ...req.body,
        userId: req.user!.userId,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });
      res.status(201).json({ status: 'success', data: contract });
    } catch (err) { next(err); }
  }
);

router.post('/from-proposal/:proposalId',
  authorize(UserRole.ADMIN, UserRole.GERENTE),
  [body('startDate').isISO8601().withMessage('A data de início é obrigatória.')],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const contract = await contractService.createFromProposal(
        req.params.proposalId,
        req.user!.userId,
        new Date(req.body.startDate),
        req.body.endDate ? new Date(req.body.endDate) : undefined
      );
      res.status(201).json({ status: 'success', data: contract });
    } catch (err) { next(err); }
  }
);

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contract = await contractService.getById(req.params.id);
    res.json({ status: 'success', data: contract });
  } catch (err) { next(err); }
});

router.get('/:id/monthly-value', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const value = await contractService.calculateMonthlyValue(req.params.id);
    res.json({ status: 'success', data: value });
  } catch (err) { next(err); }
});

router.patch('/:id/status',
  authorize(UserRole.ADMIN, UserRole.GERENTE),
  [body('status').isIn(Object.values(ContractStatus)).withMessage('Status inválido.')],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const contract = await contractService.updateStatus(req.params.id, req.body.status);
      res.json({ status: 'success', data: contract });
    } catch (err) { next(err); }
  }
);

export { router as contractRouter };
