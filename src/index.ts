import path from 'path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { config } from './auth/config/env.config';
import { generalApiRateLimiter } from './auth/middleware/rate-limit.middleware';
import authRoutes from './auth/routes/auth.routes';
import { logger } from './config/logger.config';
import adminRoutes from './routes/admin.routes';
import applicationRoutes from './routes/application.routes';
import companyRoutes from './routes/company.routes';
import dashboardRoutes from './routes/dashboard.routes';
import jobRoutes from './routes/job.routes';
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

// Apply general rate limiting to all API routes
app.use('/api', generalApiRateLimiter);

// Trust the first hop from the proxy (AWS Load Balancer)
app.set('trust proxy', 1);

// Routes
app.use('/auth', authRoutes);
app.use('/api/user-details', userDetailsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// API Documentation endpoint (via Swagger UI)
try {
  const openapiDocument = YAML.load(path.join(__dirname, '../openapi.yaml')) as Record<
    string,
    unknown
  >;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
  logger.info('API documentation is available at /api-docs');
} catch (error) {
  logger.error(error, 'Failed to load or parse openapi.yaml for API docs');
}
// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});
