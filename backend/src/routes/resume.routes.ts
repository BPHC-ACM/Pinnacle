import { Router } from 'express';

import { authenticateToken } from '../auth/middleware';
import {
  generateResume,
  generateMyResume,
  getResumePreviewData,
  getTemplates,
  getSavedResumes,
  getSavedResume,
  createSavedResume,
  updateSavedResume,
  deleteSavedResume,
  getResumeDownloadUrl,
  deleteResumeFile,
  getResumeFileInfo,
} from '../controllers/resume.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/resume/preview
 * @desc Get all user data for resume preview (JSON format)
 * @returns ResumePreviewData object
 * @access Private (requires JWT authentication)
 */
router.get('/preview', getResumePreviewData);

/**
 * @route GET /api/resume/templates
 * @desc Get available resume templates
 * @returns Array of TemplateInfo objects
 * @access Private (requires JWT authentication)
 */
router.get('/templates', getTemplates);

/**
 * @route GET /api/resume/saved
 * @desc Get all saved resumes for the authenticated user
 * @returns Array of SavedResume objects
 * @access Private (requires JWT authentication)
 */
router.get('/saved', getSavedResumes);

/**
 * @route GET /api/resume/saved/:id
 * @desc Get a specific saved resume by ID
 * @param id - The ID of the saved resume
 * @returns SavedResume object
 * @access Private (requires JWT authentication)
 */
router.get('/saved/:id', getSavedResume);

/**
 * @route POST /api/resume/saved
 * @desc Create a new saved resume
 * @body CreateResumeRequest
 * @returns Created SavedResume object
 * @access Private (requires JWT authentication)
 */
router.post('/saved', createSavedResume);

/**
 * @route PATCH /api/resume/saved/:id
 * @desc Update a saved resume
 * @param id - The ID of the saved resume
 * @body UpdateResumeRequest
 * @returns Updated SavedResume object
 * @access Private (requires JWT authentication)
 */
router.patch('/saved/:id', updateSavedResume);

/**
 * @route DELETE /api/resume/saved/:id
 * @desc Delete a saved resume (soft delete)
 * @param id - The ID of the saved resume
 * @returns 204 No Content
 * @access Private (requires JWT authentication)
 */
router.delete('/saved/:id', deleteSavedResume);

/**
 * @route POST /api/resume/generate
 * @desc Generate a PDF resume for the authenticated user
 * @returns PDF file download
 * @access Private (requires JWT authentication)
 */
router.post('/generate', generateMyResume);

/**
 * @route POST /api/resume/generate/:userId
 * @desc Generate a PDF resume for the specified user
 * @param userId - The ID of the user to generate resume for
 * @returns PDF file download
 * @access Private (requires JWT authentication)
 * @security Users can only generate their own resume (admins can generate any)
 */
router.post('/generate/:userId', generateResume);

/**
 * @route GET /api/resume/download/:resumeId
 * @desc Get download URL for a stored resume PDF
 * @param resumeId - The ID of the saved resume
 * @returns Download URL (presigned, expires in 1 hour)
 * @access Private (requires JWT authentication)
 */
router.get('/download/:resumeId', getResumeDownloadUrl);

/**
 * @route GET /api/resume/file-info/:resumeId
 * @desc Get metadata about stored resume PDF file
 * @param resumeId - The ID of the saved resume
 * @returns File metadata (size, mimeType, createdAt, etc.)
 * @access Private (requires JWT authentication)
 */
router.get('/file-info/:resumeId', getResumeFileInfo);

/**
 * @route DELETE /api/resume/file/:resumeId
 * @desc Delete stored resume PDF file from storage
 * @param resumeId - The ID of the saved resume
 * @returns Success message
 * @access Private (requires JWT authentication)
 */
router.delete('/file/:resumeId', deleteResumeFile);

export default router;
