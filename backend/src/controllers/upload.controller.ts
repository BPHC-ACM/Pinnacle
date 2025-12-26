import type { Request, Response } from 'express';
import multer from 'multer';

import { logger } from '@/config/logger.config';
import prisma from '@/db/client';
import imageStorageService from '@/services/storage-service/image-storage.service';
import type {
  UserWithPicture,
  CompanyWithLogo,
  JobWithDocument,
} from '@/types/prisma-helpers.types';

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  },
});

// Middleware for handling single file upload
export const uploadSingleImage = upload.single('file');

/**
 * @route POST /api/upload/profile-picture
 * @desc Upload user profile picture
 * @access Private (requires authentication)
 */
export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as { id?: string })?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;

    // Upload to storage
    const { url } = await imageStorageService.uploadProfilePicture(
      userId,
      buffer,
      originalname,
      mimetype,
    );

    // Update user profile with new picture URL
    const updateResult: unknown = await prisma.user.update({
      where: { id: userId },
      data: { picture: url },
    });
    void updateResult;

    logger.info({ userId, url }, 'Profile picture updated');
    res.json({ url, message: 'Profile picture uploaded successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to upload profile picture');

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  }
};

/**
 * @route DELETE /api/upload/profile-picture
 * @desc Delete user profile picture
 * @access Private (requires authentication)
 */
export const deleteProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as { id?: string })?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = (await prisma.user.findUnique({
      where: { id: userId },
      select: { picture: true, id: true },
    })) as UserWithPicture | null;

    if (!user?.picture) {
      res.status(404).json({ error: 'No profile picture found' });
      return;
    }

    // Extract object key from URL and delete from storage
    const objectKey = imageStorageService.extractObjectKeyFromUrl(user.picture);
    if (objectKey) {
      await imageStorageService.deleteProfilePicture(objectKey);
    }

    // Remove picture URL from database
    const updateResult: unknown = await prisma.user.update({
      where: { id: userId },
      data: { picture: null },
    });
    void updateResult;

    logger.info({ userId }, 'Profile picture deleted');
    res.json({ message: 'Profile picture deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to delete profile picture');
    res.status(500).json({ error: 'Failed to delete profile picture' });
  }
};

/**
 * @route POST /api/upload/company-logo/:companyId
 * @desc Upload company logo (Admin only)
 * @access Private (requires admin authentication)
 */
export const uploadCompanyLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      res.status(400).json({ error: 'Company ID required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;

    // Check if company exists
    const company = (await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { id: true, logo: true, deletedAt: true },
    })) as CompanyWithLogo | null;

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    // Upload to storage
    const { url } = await imageStorageService.uploadCompanyLogo(
      companyId,
      buffer,
      originalname,
      mimetype,
    );

    // Update company with new logo URL
    const updateResult: unknown = await prisma.company.update({
      where: { id: companyId },
      data: { logo: url },
    });
    void updateResult;

    logger.info({ companyId, url }, 'Company logo updated');
    res.json({ url, message: 'Company logo uploaded successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to upload company logo');

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to upload company logo' });
    }
  }
};

/**
 * @route DELETE /api/upload/company-logo/:companyId
 * @desc Delete company logo (Admin only)
 * @access Private (requires admin authentication)
 */
export const deleteCompanyLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    const company = (await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
      select: { logo: true },
    })) as { logo: string | null } | null;

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    if (!company.logo) {
      res.status(404).json({ error: 'No company logo found' });
      return;
    }

    // Extract object key from URL and delete from storage
    const objectKey = imageStorageService.extractObjectKeyFromUrl(company.logo);
    if (objectKey) {
      await imageStorageService.deleteCompanyLogo(objectKey);
    }

    // Remove logo URL from database
    const updateResult: unknown = await prisma.company.update({
      where: { id: companyId },
      data: { logo: null },
    });
    void updateResult;

    logger.info({ companyId }, 'Company logo deleted');
    res.json({ message: 'Company logo deleted successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to delete company logo');
    res.status(500).json({ error: 'Failed to delete company logo' });
  }
};

/**
 * @route POST /api/upload/job-document/:jobId
 * @desc Upload job description document (Admin only)
 * @access Private (requires admin authentication)
 */
export const uploadJobDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      res.status(400).json({ error: 'Job ID required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { buffer, originalname, mimetype } = req.file;

    // Check if job exists
    const job = (await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: { id: true, descriptionDocument: true, deletedAt: true },
    })) as JobWithDocument | null;

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Upload to storage
    const { url } = await imageStorageService.uploadJobDocument(
      jobId,
      buffer,
      originalname,
      mimetype,
    );

    // Update job with new document URL
    const updateResult: unknown = await prisma.job.update({
      where: { id: jobId },
      data: { descriptionDocument: url },
    });
    void updateResult;

    logger.info({ jobId, url }, 'Job document updated');
    res.json({ url, message: 'Job document uploaded successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Failed to upload job document');

    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to upload job document' });
    }
  }
};
