import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { authRouter } from './routes/auth.routes';
import { clientRouter } from './routes/client.routes';
import { productRouter } from './routes/product.routes';
import { proposalRouter } from './routes/proposal.routes';
import { contractRouter } from './routes/contract.routes';
import { invoiceRouter } from './routes/invoice.routes';
import { receivableRouter } from './routes/receivable.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Segurança e parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requisições HTTP
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da aplicação
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/clients', clientRouter);
app.use('/api/products', productRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/invoices', invoiceRouter);
app.use('/api/receivables', receivableRouter);
app.use('/api/dashboard', dashboardRouter);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

export default app;
