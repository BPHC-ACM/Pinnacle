import { Router } from 'express';

import { authenticateToken, isAdmin } from '../auth/middleware';
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

// Job routes (admin only)
router.post('/jobs', authenticateToken, isAdmin, createJob);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.patch('/jobs/:id/close', authenticateToken, isAdmin, closeJob);

// Application routes
router.post('/jobs/:jobId/apply', authenticateToken, apply);
router.get('/applications', authenticateToken, getUserApplications);
router.get('/jobs/:jobId/applications', authenticateToken, isAdmin, getJobApplications);
router.patch('/applications/:id/status', authenticateToken, isAdmin, updateApplicationStatus);
router.post('/applications/:id/withdraw', authenticateToken, withdrawApplication);

export default router;
