import { Router } from 'express';

import { authenticateToken } from '../auth/middleware/auth.middleware';
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

// Job routes
router.post('/jobs', authenticateToken, createJob);
router.get('/jobs', getJobs);
router.get('/jobs/:id', getJob);
router.patch('/jobs/:id/close', authenticateToken, closeJob);

// Application routes
router.post('/jobs/:jobId/apply', authenticateToken, apply);
router.get('/applications', authenticateToken, getUserApplications);
router.get('/jobs/:jobId/applications', authenticateToken, getJobApplications);
router.patch('/applications/:id/status', authenticateToken, updateApplicationStatus);
router.post('/applications/:id/withdraw', authenticateToken, withdrawApplication);

export default router;
