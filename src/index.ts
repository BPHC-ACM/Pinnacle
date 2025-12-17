import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import pinoHttp from 'pino-http';

import { config } from './auth/config/env.config';
import authRoutes from './auth/routes/auth.routes';
import { logger } from './config/logger.config';
import applicationRoutes from './routes/application.routes';
import companyRoutes from './routes/company.routes';
import userDetailsRoutes from './routes/user-details.routes';
import resumeRoutes from './services/resume-service/routes/resume.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/user-details', userDetailsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', applicationRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});
