import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import memberRoutes from './routes/member.routes.js';
import publicRoutes from './routes/public.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/apiResponse.js';

export const app = express();

app.use(cors({ origin: env.clientOrigin }));

app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_request, response) =>
  sendSuccess(response, {
    message: 'CoSpace API is running.',
    data: { status: 'healthy' },
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);
