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
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller';

const router = Router();

// Job routes (admin only with rate limiting)
router.post('/jobs', adminRateLimiter, authenticateToken, isAdmin, createJob);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.patch('/jobs/:id/close', adminRateLimiter, authenticateToken, isAdmin, closeJob);

// Application routes (with rate limiting to prevent spam)
router.post('/jobs/:jobId/apply', sensitiveEndpointRateLimiter, authenticateToken, apply);
router.get('/applications', authenticateToken, getUserApplications);
router.get('/jobs/:jobId/applications', authenticateToken, isAdmin, getJobApplications);
router.patch(
  '/applications/:id/status',
  adminRateLimiter,
  authenticateToken,
  isAdmin,
  updateApplicationStatus,
);
router.post(
  '/applications/:id/withdraw',
  sensitiveEndpointRateLimiter,
  authenticateToken,
  withdrawApplication,
);

export default router;
