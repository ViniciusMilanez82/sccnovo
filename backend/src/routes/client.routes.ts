import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { clientService } from '../services/client.service';
import { AppError } from '../middleware/errorHandler';
import { PersonType, ClientStatus } from '@prisma/client';

const router = Router();
router.use(authenticate);

const validateClient = [
  body('personType').isIn(Object.values(PersonType)).withMessage('Tipo de pessoa inválido (PF ou PJ).'),
  body('name').trim().notEmpty().withMessage('O nome/razão social é obrigatório.'),
  body('document').trim().notEmpty().withMessage('O CPF/CNPJ é obrigatório.'),
  body('email').optional().isEmail().withMessage('Informe um e-mail válido.'),
];

/**
 * GET /api/clients
 * Lista clientes com paginação e filtros (search, status).
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página inválida.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite inválido.'),
    query('status').optional().isIn(Object.values(ClientStatus)).withMessage('Status inválido.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

    try {
      const result = await clientService.list({
        search: req.query.search as string,
        status: req.query.status as ClientStatus,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });
      res.json({ status: 'success', ...result });
    } catch (err) { next(err); }
  }
);

/**
 * POST /api/clients
 * Cria um novo cliente (com endereços opcionais).
 */
router.post('/', validateClient, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError(errors.array()[0].msg, 400));

  try {
    const client = await clientService.create(req.body);
    res.status(201).json({ status: 'success', data: client });
  } catch (err) { next(err); }
});

/**
 * GET /api/clients/:id
 * Retorna um cliente com todos os seus endereços.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.getById(req.params.id);
    res.json({ status: 'success', data: client });
  } catch (err) { next(err); }
});

/**
 * PUT /api/clients/:id
 * Atualiza os dados principais de um cliente.
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.update(req.params.id, req.body);
    res.json({ status: 'success', data: client });
  } catch (err) { next(err); }
});

/**
 * POST /api/clients/:id/addresses
 * Adiciona um endereço a um cliente.
 */
router.post('/:id/addresses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await clientService.addAddress(req.params.id, req.body);
    res.status(201).json({ status: 'success', data: address });
  } catch (err) { next(err); }
});

/**
 * PUT /api/clients/:id/addresses/:addressId
 * Atualiza um endereço específico de um cliente.
 */
router.put('/:id/addresses/:addressId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await clientService.updateAddress(req.params.id, req.params.addressId, req.body);
    res.json({ status: 'success', data: address });
  } catch (err) { next(err); }
});

/**
 * DELETE /api/clients/:id/addresses/:addressId
 * Remove um endereço não-principal de um cliente.
 */
router.delete('/:id/addresses/:addressId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clientService.deleteAddress(req.params.id, req.params.addressId);
    res.status(204).send();
  } catch (err) { next(err); }
});

export { router as clientRouter };
