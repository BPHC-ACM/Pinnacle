import type { RequestHandler } from 'express';
import { Router } from 'express';

import {
  authenticateToken,
  isAdmin,
  sensitiveEndpointRateLimiter,
  adminRateLimiter,
} from '../auth/middleware';
import {
  createJob,
  getJob,
  getJobs,
  closeJob,
  apply,
  getJobApplications,
} from '../controllers/job.controller';
import { validateBody } from '../middleware/validate.middleware';
import { createJobSchema } from '../types/application.types';

const router = Router();

// Job routes (admin only with rate limiting)
router.post(
  '/',
  adminRateLimiter as RequestHandler,
  authenticateToken,
  isAdmin,
  validateBody(createJobSchema),
  createJob,
);
router.get('/', getJobs);
router.get('/:id', getJob);
router.patch(
  '/:id/close',
  adminRateLimiter as RequestHandler,
  authenticateToken,
  isAdmin,
  closeJob,
);

// Application routes nested under jobs (with rate limiting to prevent spam)
router.post(
  '/:jobId/applications',
  sensitiveEndpointRateLimiter as RequestHandler,
  authenticateToken,
  apply,
);
router.get('/:jobId/applications', authenticateToken, isAdmin, getJobApplications);

export default router;
