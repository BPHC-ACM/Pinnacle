import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

import { config } from './auth/config/env.config';
import authRoutes from './auth/routes/auth.routes';
import companyRoutes from './routes/company.routes';
import userDetailsRoutes from './routes/user-details.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/api/user-details', userDetailsRoutes);
app.use('/api/companies', companyRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
