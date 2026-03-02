import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { productService } from '../services/product.service';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

router.get('/',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productService.list({
        search: req.query.search as string,
        active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });
      res.json({ status: 'success', ...result });
    } catch (err) { next(err); }
  }
);

router.post('/',
  authorize(UserRole.ADMIN, UserRole.GERENTE),
  [
    body('code').trim().notEmpty().withMessage('O código do produto é obrigatório.'),
    body('description').trim().notEmpty().withMessage('A descrição é obrigatória.'),
    body('unitPrice').isFloat({ min: 0.01 }).withMessage('O preço unitário deve ser maior que zero.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ status: 'success', data: product });
    } catch (err) { next(err); }
  }
);

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getById(req.params.id);
    res.json({ status: 'success', data: product });
  } catch (err) { next(err); }
});

router.put('/:id', authorize(UserRole.ADMIN, UserRole.GERENTE), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.json({ status: 'success', data: product });
  } catch (err) { next(err); }
});

export { router as productRouter };
