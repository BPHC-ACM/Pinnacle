import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import pinoHttp from 'pino-http';

import { config } from './auth/config/env.config';
import { generalApiRateLimiter } from './auth/middleware/rate-limit.middleware';
import authRoutes from './auth/routes/auth.routes';
import { logger } from './config/logger.config';
import applicationRoutes from './routes/application.routes';
import companyRoutes from './routes/company.routes';
import dashboardRoutes from './routes/dashboard.routes';
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

// API Documentation endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'ACM-X-PU API',
    version: '1.0.0',
    description: 'API for ACM-X-PU Resume Builder and User Management',
    endpoints: {
      auth: {
        base: '/auth',
        routes: {
          'GET /google/login': 'Initiate Google OAuth login',
          'GET /google/callback': 'Google OAuth callback',
          'POST /refresh': 'Refresh access token',
          'GET /me': 'Get current authenticated user (requires auth)',
        },
      },
      userDetails: {
        base: '/api/user-details',
        description: 'All routes require authentication',
        routes: {
          'GET /profile': 'Get user profile',
          'PATCH /profile': 'Update user profile',
          'GET /experiences': 'Get all experiences',
          'POST /experiences': 'Create experience',
          'PATCH /experiences/:id': 'Update experience',
          'DELETE /experiences/:id': 'Delete experience',
          'GET /education': 'Get all education',
          'POST /education': 'Create education',
          'PATCH /education/:id': 'Update education',
          'DELETE /education/:id': 'Delete education',
          'GET /skills': 'Get all skills',
          'POST /skills': 'Create skill',
          'PATCH /skills/:id': 'Update skill',
          'DELETE /skills/:id': 'Delete skill',
          'GET /projects': 'Get all projects',
          'POST /projects': 'Create project',
          'PATCH /projects/:id': 'Update project',
          'DELETE /projects/:id': 'Delete project',
          'GET /certifications': 'Get all certifications',
          'POST /certifications': 'Create certification',
          'PATCH /certifications/:id': 'Update certification',
          'DELETE /certifications/:id': 'Delete certification',
          'GET /languages': 'Get all languages',
          'POST /languages': 'Create language',
          'PATCH /languages/:id': 'Update language',
          'DELETE /languages/:id': 'Delete language',
        },
      },
      companies: {
        base: '/api/companies',
        description: 'All routes require authentication',
        routes: {
          'GET /': 'Get all companies',
          'GET /:id': 'Get company by ID',
          'POST /': 'Create company (admin only)',
          'PATCH /:id': 'Update company (admin only)',
          'DELETE /:id': 'Delete company (admin only)',
          'GET /search?q=query': 'Search companies',
        },
      },
      resume: {
        base: '/api/resume',
        description: 'All routes require authentication',
        routes: {
          'GET /preview': 'Get all user data for resume preview (JSON)',
          'GET /templates': 'Get available resume templates',
          'GET /saved': 'Get all saved resumes',
          'GET /saved/:id': 'Get a specific saved resume',
          'POST /saved': 'Create a new saved resume',
          'PATCH /saved/:id': 'Update a saved resume',
          'DELETE /saved/:id': 'Delete a saved resume',
          'POST /generate': 'Generate PDF resume for authenticated user',
          'POST /generate/:userId': 'Generate PDF resume for specific user',
        },
      },
      dashboard: {
        base: '/api/dashboard',
        description: 'All routes require authentication',
        routes: {
          'GET /': 'Get all user data in one request',
          'GET /stats': 'Get user statistics (counts)',
          'GET /profile-completion': 'Get profile completion percentage',
        },
      },
    },
  });
});
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
