import express from 'express';

import { authenticateToken } from '../auth/middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/dashboard
 * @desc Get all user data in one request
 * @returns { profile, experiences, education, skills, projects, certifications, languages, counts }
 * @access Private (requires JWT authentication)
 */
router.get('/', dashboardController.getDashboardData);

/**
 * @route GET /api/dashboard/stats
 * @desc Get user statistics (counts only)
 * @returns { experiences, education, skills, skillItems, projects, certifications, languages }
 * @access Private (requires JWT authentication)
 */
router.get('/stats', dashboardController.getDashboardStats);

/**
 * @route GET /api/dashboard/profile-completion
 * @desc Get profile completion percentage and missing fields
 * @returns { completionPercentage, completedFields, missingFields, recommendations }
 * @access Private (requires JWT authentication)
 */
router.get('/profile-completion', dashboardController.getProfileCompletion);

export default router;
