import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// TODO: Implementar rotas do módulo receivable nas sprints seguintes
router.get('/', (_req, res) => {
  res.status(501).json({ status: 'not_implemented', message: 'A ser implementado nas próximas sprints.' });
});

export { router as receivableRouter };
