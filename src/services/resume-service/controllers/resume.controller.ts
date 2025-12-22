import { Request, Response } from 'express';

import { logger } from '../../../config/logger.config';
import type { CreateResumeRequest, UpdateResumeRequest } from '../../../types/resume.types';
import { UserService } from '../../user-service/user.service';
import resumeService from '../resume.service';
import resumeStorageService from '../storage/resume-storage.service';
import { generateResumePDF } from '../utils/pdf.utils';

const userService = new UserService();

/**
 * Validates that user has minimum required fields for resume generation
 */
const validateRequiredFields = (profile: {
  name?: string;
  email?: string;
}): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  // Required fields for a basic resume
  if (!profile.name) missing.push('name');
  if (!profile.email) missing.push('email');

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * @route GET /api/resume/preview
 * @desc Get all user data for resume preview (JSON format)
 * @access Private (requires authentication)
 */
export const getResumePreviewData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const previewData = await resumeService.getResumePreviewData(userId);

    if (!previewData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(previewData);
  } catch (error) {
    console.error('Error fetching resume preview data:', error);
    res.status(500).json({ error: 'Failed to fetch resume preview data' });
  }
};

/**
 * @route GET /api/resume/templates
 * @desc Get available resume templates
 * @access Private (requires authentication)
 */
export const getTemplates = (_req: Request, res: Response): void => {
  try {
    const templates = resumeService.getAvailableTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

/**
 * @route GET /api/resume/saved
 * @desc Get all saved resumes for the authenticated user
 * @access Private (requires authentication)
 */
export const getSavedResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const resumes = await resumeService.getSavedResumes(userId);
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching saved resumes:', error);
    res.status(500).json({ error: 'Failed to fetch saved resumes' });
  }
};

/**
 * @route GET /api/resume/saved/:id
 * @desc Get a specific saved resume
 * @access Private (requires authentication)
 */
export const getSavedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!id) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    const resume = await resumeService.getSavedResume(userId, id);

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.json(resume);
  } catch (error) {
    console.error('Error fetching saved resume:', error);
    res.status(500).json({ error: 'Failed to fetch saved resume' });
  }
};

/**
 * @route POST /api/resume/saved
 * @desc Create a new saved resume
 * @access Private (requires authentication)
 */
export const createSavedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const data = req.body as CreateResumeRequest;

    if (!data.title) {
      res.status(400).json({ error: 'Resume title is required' });
      return;
    }

    if (!data.data) {
      res.status(400).json({ error: 'Resume data is required' });
      return;
    }

    // Validate template if provided
    if (data.template && !resumeService.isValidTemplate(data.template)) {
      res.status(400).json({
        error: 'Invalid template',
        validTemplates: ['modern', 'classic', 'minimal', 'professional'],
      });
      return;
    }

    const resume = await resumeService.createResume(userId, data);
    res.status(201).json(resume);
  } catch (error) {
    console.error('Error creating saved resume:', error);
    res.status(500).json({ error: 'Failed to create saved resume' });
  }
};

/**
 * @route PATCH /api/resume/saved/:id
 * @desc Update a saved resume
 * @access Private (requires authentication)
 */
export const updateSavedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!id) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    const data = req.body as UpdateResumeRequest;

    // Validate template if provided
    if (data.template && !resumeService.isValidTemplate(data.template)) {
      res.status(400).json({
        error: 'Invalid template',
        validTemplates: ['modern', 'classic', 'minimal', 'professional'],
      });
      return;
    }

    const resume = await resumeService.updateResume(userId, id, data);

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.json(resume);
  } catch (error) {
    console.error('Error updating saved resume:', error);
    res.status(500).json({ error: 'Failed to update saved resume' });
  }
};

/**
 * @route DELETE /api/resume/saved/:id
 * @desc Delete a saved resume
 * @access Private (requires authentication)
 */
export const deleteSavedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!id) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    const success = await resumeService.deleteResume(userId, id);

    if (!success) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting saved resume:', error);
    res.status(500).json({ error: 'Failed to delete saved resume' });
  }
};

/**
 * @route POST /api/resume/generate/:userId
 * @desc Generate a PDF resume for a user and store it in Minio
 * @access Private (requires authentication)
 */
export const generateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user?.id;
    const { resumeId, saveToStorage = true } = req.body as {
      resumeId?: string;
      saveToStorage?: boolean;
    };

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!authenticatedUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Authorization: Users can only generate their own resume, admins can generate any
    if (userId !== authenticatedUserId && String(req.user?.role) !== 'ADMIN') {
      res.status(403).json({
        error: 'Forbidden: You can only generate your own resume',
      });
      return;
    }

    // Fetch all user data from database using existing service
    const profile = await userService.getUserProfile(userId);
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Validate required fields are present
    const validation = validateRequiredFields(profile);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Missing required fields for resume generation',
        missingFields: validation.missing,
        message: `Please complete your profile. Missing: ${validation.missing.join(', ')}`,
      });
      return;
    }

    const experiences = await userService.getExperiences(userId);
    const education = await userService.getEducation(userId);
    const skills = await userService.getSkills(userId);
    const projects = await userService.getProjects(userId);

    // Generate PDF with database types directly (no transformation needed!)
    const pdfBuffer = await generateResumePDF({
      profile,
      experiences,
      education,
      skills,
      projects,
    });

    const fileName = `${profile.name.replace(/\s+/g, '_')}_Resume`;

    // If resumeId provided and saveToStorage is true, save to Minio
    if (resumeId && saveToStorage) {
      try {
        const { fileId, downloadUrl } = await resumeStorageService.uploadResumePDF(
          resumeId,
          pdfBuffer,
          fileName,
        );

        logger.info({ userId, resumeId, fileId }, 'Resume PDF saved to storage');

        res.json({
          message: 'Resume generated and saved successfully',
          fileId,
          downloadUrl,
          resumeId,
        });
        return;
      } catch (error) {
        logger.error({ err: error, userId, resumeId }, 'Failed to save resume to storage');
        // Continue to send PDF directly as fallback
      }
    }

    // Default: Send PDF directly as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error({ err: error }, 'Failed to generate resume');
    res.status(500).json({ error: 'Failed to generate resume' });
  }
};

/**
 * @route POST /api/resume/generate
 * @desc Generate a PDF resume for the authenticated user (shorthand)
 * @access Private (requires authentication)
 */
export const generateMyResume = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Set userId in params and call the main generate function
  req.params.userId = userId;
  await generateResume(req, res);
};

/**
 * @route GET /api/resume/download/:resumeId
 * @desc Get download URL for a stored resume PDF
 * @access Private (requires authentication)
 */
export const getResumeDownloadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { resumeId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!resumeId) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    // Verify resume belongs to user
    const resume = await resumeService.getSavedResume(userId, resumeId);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Get download URL
    const downloadUrl = await resumeStorageService.getResumeDownloadUrl(resumeId);
    if (!downloadUrl) {
      res.status(404).json({ error: 'Resume PDF not found in storage' });
      return;
    }

    res.json({ downloadUrl, expiresIn: 3600 });
  } catch (error) {
    logger.error({ err: error }, 'Failed to get resume download URL');
    res.status(500).json({ error: 'Failed to get resume download URL' });
  }
};

/**
 * @route DELETE /api/resume/file/:resumeId
 * @desc Delete stored resume PDF file
 * @access Private (requires authentication)
 */
export const deleteResumeFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { resumeId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!resumeId) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    // Verify resume belongs to user
    const resume = await resumeService.getSavedResume(userId, resumeId);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Delete file from storage
    const success = await resumeStorageService.deleteResumePDF(resumeId);
    if (!success) {
      res.status(404).json({ error: 'Resume PDF not found in storage' });
      return;
    }

    res.json({ message: 'Resume PDF deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to delete resume file');
    res.status(500).json({ error: 'Failed to delete resume file' });
  }
};

/**
 * @route GET /api/resume/file-info/:resumeId
 * @desc Get metadata about stored resume PDF
 * @access Private (requires authentication)
 */
export const getResumeFileInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { resumeId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!resumeId) {
      res.status(400).json({ error: 'Resume ID is required' });
      return;
    }

    // Verify resume belongs to user
    const resume = await resumeService.getSavedResume(userId, resumeId);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    // Get file metadata
    const fileInfo = await resumeStorageService.getResumeFileMetadata(resumeId);
    if (!fileInfo) {
      res.status(404).json({ error: 'Resume PDF not found in storage' });
      return;
    }

    res.json(fileInfo);
  } catch (error) {
    logger.error({ err: error }, 'Failed to get resume file info');
    res.status(500).json({ error: 'Failed to get resume file info' });
  }
};
