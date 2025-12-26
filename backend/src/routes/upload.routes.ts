import { Router } from 'express';

import { authenticateToken, isAdmin } from '../auth/middleware';
import {
  uploadProfilePicture,
  deleteProfilePicture,
  uploadCompanyLogo,
  deleteCompanyLogo,
  uploadJobDocument,
  uploadSingleImage,
} from '../controllers/upload.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/upload/profile-picture
 * @desc Upload user profile picture
 * @access Private (requires JWT authentication)
 */
router.post('/profile-picture', uploadSingleImage, uploadProfilePicture);

/**
 * @route DELETE /api/upload/profile-picture
 * @desc Delete user profile picture
 * @access Private (requires JWT authentication)
 */
router.delete('/profile-picture', deleteProfilePicture);

/**
 * @route POST /api/upload/company-logo/:companyId
 * @desc Upload company logo
 * @access Private (requires admin authentication)
 */
router.post('/company-logo/:companyId', isAdmin, uploadSingleImage, uploadCompanyLogo);

/**
 * @route DELETE /api/upload/company-logo/:companyId
 * @desc Delete company logo
 * @access Private (requires admin authentication)
 */
router.delete('/company-logo/:companyId', isAdmin, deleteCompanyLogo);

/**
 * @route POST /api/upload/job-document/:jobId
 * @desc Upload job description document
 * @access Private (requires admin authentication)
 */
router.post('/job-document/:jobId', isAdmin, uploadSingleImage, uploadJobDocument);

export default router;
