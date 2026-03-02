import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas as rotas de clientes exigem autenticação
router.use(authenticate);

/**
 * GET /api/clients
 * Lista todos os clientes com paginação e filtros.
 * TODO: Implementar na US-CAD-001
 */
router.get('/', (_req, res) => {
  res.status(501).json({ status: 'not_implemented', message: 'US-CAD-001: A ser implementado na Sprint 2.' });
});

/**
 * POST /api/clients
 * Cria um novo cliente.
 * TODO: Implementar na US-CAD-001
 */
router.post('/', (_req, res) => {
  res.status(501).json({ status: 'not_implemented', message: 'US-CAD-001: A ser implementado na Sprint 2.' });
});

/**
 * GET /api/clients/:id
 * Retorna um cliente pelo ID.
 * TODO: Implementar na US-CAD-001
 */
router.get('/:id', (_req, res) => {
  res.status(501).json({ status: 'not_implemented', message: 'US-CAD-001: A ser implementado na Sprint 2.' });
});

/**
 * PUT /api/clients/:id
 * Atualiza um cliente.
 * TODO: Implementar na US-CAD-001
 */
router.put('/:id', (_req, res) => {
  res.status(501).json({ status: 'not_implemented', message: 'US-CAD-001: A ser implementado na Sprint 2.' });
});

export { router as clientRouter };
