import { Router, type RequestHandler } from 'express';

import { isAdmin } from '@/auth/middleware/admin.middleware';
import { authenticateToken } from '@/auth/middleware/auth.middleware';
import {
  // Dashboard
  getAdminDashboard,
  // Jobs
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  pauseJob,
  reopenJob,
  exportJobApplications,
  // Applications
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
  deleteApplication,
  getApplicantProfile,
  getJobApplicationsAdmin,
} from '@/controllers/admin.controller';
import { createJob } from '@/controllers/job.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken as RequestHandler, isAdmin as RequestHandler);

// ==================== DASHBOARD ====================
router.get('/dashboard', getAdminDashboard);

// ==================== JOBS MANAGEMENT ====================
router.post('/jobs', createJob); // Create new job
router.get('/jobs', getAllJobs); // List all jobs with stats
router.get('/jobs/:id', getJobById); // Get single job
router.patch('/jobs/:id', updateJob); // Update job details
router.delete('/jobs/:id', deleteJob); // Soft delete job
router.patch('/jobs/:id/pause', pauseJob); // Pause job
router.patch('/jobs/:id/reopen', reopenJob); // Reopen closed/paused job
router.get('/jobs/:id/export', exportJobApplications); // Export job applications data
router.get('/jobs/:jobId/applications', getJobApplicationsAdmin); // Get all applications for a job

// ==================== APPLICATIONS MANAGEMENT ====================
router.get('/applications', getAllApplications); // List all applications with filters
router.get('/applications/:id', getApplicationById); // Get single application with details
router.patch('/applications/:id/status', updateApplicationStatus); // Update status
router.post('/applications/bulk-status', bulkUpdateApplicationStatus); // Bulk update status
router.delete('/applications/:id', deleteApplication); // Delete application
router.get('/applications/:id/profile', getApplicantProfile); // Get applicant's full profile

export default router;
