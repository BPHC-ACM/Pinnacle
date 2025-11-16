import { Router } from 'express';

import { authenticateToken } from '../../../auth/middleware/auth.middleware';
import { generateResume } from '../controllers/resume.controller';

const router = Router();

/**
 * @route POST /api/resume/generate/:userId
 * @desc Generate a PDF resume for the specified user
 * @param userId - The ID of the user to generate resume for
 * @returns PDF file download
 * @access Private (requires JWT authentication)
 * @security Users can only generate their own resume (admins can generate any)
 */
router.post('/generate/:userId', authenticateToken, generateResume);

export default router;
