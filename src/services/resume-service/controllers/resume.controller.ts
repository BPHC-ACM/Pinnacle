import { Request, Response } from 'express';
import { UserService } from '../../user-service/user.service';
import { generateResumePDF } from '../utils/pdf.utils';

const userService = new UserService();

/**
 * Validates that user has minimum required fields for resume generation
 */
const validateRequiredFields = (profile: any): { valid: boolean; missing: string[] } => {
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
 * @route POST /api/resume/generate/:userId
 * @desc Generate a PDF resume for a user
 * @access Private (requires authentication)
 */
export const generateResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user?.id;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!authenticatedUserId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Authorization: Users can only generate their own resume, admins can generate any
    if (userId !== authenticatedUserId && req.user?.role !== 'ADMIN') {
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

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${profile.name.replace(/\s+/g, '_')}_Resume.pdf"`,
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
};
