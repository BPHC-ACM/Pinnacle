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
  updateJobSchedule,
  getJobSchedule,
  createJobEligibility,
  getJobEligibility,
  checkEligibility,
  markAttendance,
  bulkMarkAttendance,
  getJobAttendance,
  getAttendanceStats,
} from '../controllers/job.controller';
import { requireJPT, requireAdmin } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createJobSchema,
  updateJobScheduleSchema,
  createJobEligibilitySchema,
  markAttendanceSchema,
  bulkMarkAttendanceSchema,
} from '../types/job.types';

const router = Router();

// Job routes (admin only with rate limiting)
router.post(
  '/',
  adminRateLimiter,
  authenticateToken,
  isAdmin,
  validateBody(createJobSchema),
  createJob,
);
router.get('/', getJobs);
router.get('/:id', getJob);
router.patch('/:id/close', adminRateLimiter, authenticateToken, isAdmin, closeJob);

// Job scheduling routes (admin only)
router.patch(
  '/:jobId/schedule',
  authenticateToken,
  isAdmin,
  validateBody(updateJobScheduleSchema),
  updateJobSchedule,
);
router.get('/:jobId/schedule', authenticateToken, getJobSchedule);

// Job eligibility routes
router.post(
  '/:jobId/eligibility',
  authenticateToken,
  isAdmin,
  validateBody(createJobEligibilitySchema),
  createJobEligibility,
);
router.get('/:jobId/eligibility', authenticateToken, getJobEligibility);
router.get('/:jobId/check-eligibility', authenticateToken, checkEligibility);

// Attendance routes (JPT and admin access)
router.post(
  '/:jobId/attendance',
  authenticateToken,
  requireJPT,
  validateBody(markAttendanceSchema),
  markAttendance,
);
router.post(
  '/:jobId/attendance/bulk',
  authenticateToken,
  requireJPT,
  validateBody(bulkMarkAttendanceSchema),
  bulkMarkAttendance,
);
router.get('/:jobId/attendance', authenticateToken, requireAdmin, getJobAttendance);
router.get('/:jobId/attendance/stats', authenticateToken, requireAdmin, getAttendanceStats);

// Application routes nested under jobs (with rate limiting to prevent spam)
router.post('/:jobId/applications', sensitiveEndpointRateLimiter, authenticateToken, apply);
router.get('/:jobId/applications', authenticateToken, isAdmin, getJobApplications);

export default router;
