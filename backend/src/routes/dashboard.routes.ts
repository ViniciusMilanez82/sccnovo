import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { dashboardService } from '../services/dashboard.service';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/kpis — KPIs principais
router.get('/kpis', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardService.getKpis();
    res.json({ status: 'success', data });
  } catch (err) { next(err); }
});

// GET /api/dashboard/revenue-chart — Gráfico de receita mensal
router.get('/revenue-chart', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 6;
    const data = await dashboardService.getRevenueChart(months);
    res.json({ status: 'success', data });
  } catch (err) { next(err); }
});

export { router as dashboardRouter };
