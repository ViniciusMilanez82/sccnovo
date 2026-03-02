import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { invoiceService } from '../services/invoice.service';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

// GET /api/invoices — Listar faturas com filtros
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.list({
      contractId: req.query.contractId as string,
      clientId: req.query.clientId as string,
      status: req.query.status as any,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    res.json({ status: 'success', ...result });
  } catch (err) { next(err); }
});

// POST /api/invoices — Gerar fatura a partir de um contrato
router.post('/',
  authorize(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO),
  [
    body('contractId').notEmpty().withMessage('O contrato é obrigatório.'),
    body('issueDate').isISO8601().withMessage('A data de emissão é obrigatória.'),
    body('dueDate').isISO8601().withMessage('A data de vencimento é obrigatória.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const invoice = await invoiceService.generateFromContract({
        ...req.body,
        issueDate: new Date(req.body.issueDate),
        dueDate: new Date(req.body.dueDate),
      });
      res.status(201).json({ status: 'success', data: invoice });
    } catch (err) { next(err); }
  }
);

// GET /api/invoices/:id — Detalhe da fatura
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getById(req.params.id);
    res.json({ status: 'success', data: invoice });
  } catch (err) { next(err); }
});

// PATCH /api/invoices/:id/send — Marcar como enviada
router.patch('/:id/send',
  authorize(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await invoiceService.markAsSent(req.params.id);
      res.json({ status: 'success', data: invoice });
    } catch (err) { next(err); }
  }
);

// PATCH /api/invoices/:id/cancel — Cancelar fatura
router.patch('/:id/cancel',
  authorize(UserRole.ADMIN, UserRole.GERENTE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await invoiceService.cancel(req.params.id);
      res.json({ status: 'success', data: invoice });
    } catch (err) { next(err); }
  }
);

// POST /api/invoices/check-overdue — Atualizar faturas vencidas (job)
router.post('/check-overdue',
  authorize(UserRole.ADMIN),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await invoiceService.checkOverdue();
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }
);

export { router as invoiceRouter };
