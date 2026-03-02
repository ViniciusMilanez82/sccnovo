import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { receivableService } from '../services/receivable.service';
import { AppError } from '../middleware/errorHandler';
import { InvoiceStatus, UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

// GET /api/receivables — Listar recebíveis (faturas a receber)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await receivableService.listReceivables({
      status: req.query.status as InvoiceStatus,
      clientId: req.query.clientId as string,
      dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
      dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    res.json({ status: 'success', ...result });
  } catch (err) { next(err); }
});

// GET /api/receivables/summary — Resumo financeiro
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await receivableService.getSummary(req.query.clientId as string);
    res.json({ status: 'success', data: summary });
  } catch (err) { next(err); }
});

// POST /api/receivables/payment — Registrar pagamento
router.post('/payment',
  authorize(UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO),
  [
    body('invoiceId').notEmpty().withMessage('O ID da fatura é obrigatório.'),
    body('paidAmount').isFloat({ min: 0.01 }).withMessage('O valor pago deve ser maior que zero.'),
    body('paymentDate').isISO8601().withMessage('A data de pagamento é obrigatória.'),
    body('paymentMethod').isIn(['BOLETO', 'PIX', 'TRANSFERENCIA', 'DINHEIRO', 'CARTAO']).withMessage('Método de pagamento inválido.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const result = await receivableService.registerPayment({
        ...req.body,
        paymentDate: new Date(req.body.paymentDate),
      });
      res.status(201).json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }
);

export { router as receivableRouter };
