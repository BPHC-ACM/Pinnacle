import type { RequestHandler } from 'express';
import { Router } from 'express';

import {
  authenticateToken,
  isAdmin,
  sensitiveEndpointRateLimiter,
  adminRateLimiter,
} from '../auth/middleware';
import {
  getUserApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller';

const router = Router();

// Application routes (with rate limiting to prevent spam)
router.get('/', authenticateToken, getUserApplications);
router.patch(
  '/:id/status',
  adminRateLimiter as RequestHandler,
  authenticateToken,
  isAdmin,
  updateApplicationStatus,
);
router.post(
  '/:id/withdraw',
  sensitiveEndpointRateLimiter as RequestHandler,
  authenticateToken,
  withdrawApplication,
);

export default router;
