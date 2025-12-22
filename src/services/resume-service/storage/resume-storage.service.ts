import crypto from 'crypto';

import type { ResumeFile } from '@prisma/client';

import { logger } from '@/config/logger.config';
import prisma from '@/db/client';
import { MinioBucketStorage } from '@/services/storage-service/minio-service';

const RESUME_BUCKET = 'resumes';
const resumeStorage = new MinioBucketStorage(RESUME_BUCKET);

export class ResumeStorageService {
  /**
   * Upload a resume PDF to Minio and create ResumeFile record
   */
  async uploadResumePDF(
    resumeId: string,
    pdfBuffer: Buffer,
    fileName: string,
  ): Promise<{ fileId: string; downloadUrl: string }> {
    try {
      // Generate unique object key
      const timestamp = Date.now();
      const hash = crypto.createHash('md5').update(pdfBuffer).digest('hex').substring(0, 8);
      const objectKey = `${resumeId}/${timestamp}-${hash}-${fileName.replace(/\s+/g, '_')}.pdf`;

      // Upload to Minio
      const { size } = await resumeStorage.upload(objectKey, pdfBuffer, 'application/pdf');

      // Check if ResumeFile record already exists
      const existing = await prisma.resumeFile.findUnique({
        where: { resumeId },
      });

      let fileRecord;
      if (existing) {
        // Delete old file from Minio
        try {
          await resumeStorage.delete(existing.objectKey);
        } catch {
          logger.warn({ objectKey: existing.objectKey }, 'Failed to delete old resume file');
        }

        // Update record
        fileRecord = await prisma.resumeFile.update({
          where: { resumeId },
          data: {
            bucket: RESUME_BUCKET,
            objectKey,
            mimeType: 'application/pdf',
            size,
          },
        });
      } else {
        // Create new record
        fileRecord = await prisma.resumeFile.create({
          data: {
            resumeId,
            bucket: RESUME_BUCKET,
            objectKey,
            mimeType: 'application/pdf',
            size,
          },
        });
      }

      // Generate download URL (valid for 1 hour)
      const downloadUrl = await resumeStorage.getDownloadUrl(objectKey, 3600);

      logger.info({ resumeId, objectKey, size }, 'Resume PDF uploaded successfully');

      return {
        fileId: fileRecord.id,
        downloadUrl,
      };
    } catch (error) {
      logger.error({ err: error, resumeId }, 'Failed to upload resume PDF');
      throw new Error('Failed to upload resume PDF');
    }
  }

  /**
   * Get download URL for a resume PDF
   */
  async getResumeDownloadUrl(resumeId: string, expiresInSeconds = 3600): Promise<string | null> {
    try {
      const fileRecord = await prisma.resumeFile.findUnique({
        where: { resumeId },
      });

      if (!fileRecord) {
        return null;
      }

      const downloadUrl = await resumeStorage.getDownloadUrl(
        fileRecord.objectKey,
        expiresInSeconds,
      );
      return downloadUrl;
    } catch (error) {
      logger.error({ err: error, resumeId }, 'Failed to get resume download URL');
      return null;
    }
  }

  /**
   * Delete resume PDF from storage
   */
  async deleteResumePDF(resumeId: string): Promise<boolean> {
    try {
      const fileRecord = await prisma.resumeFile.findUnique({
        where: { resumeId },
      });

      if (!fileRecord) {
        return false;
      }

      // Delete from Minio
      await resumeStorage.delete(fileRecord.objectKey);

      // Delete database record
      await prisma.resumeFile.delete({
        where: { resumeId },
      });

      logger.info({ resumeId, objectKey: fileRecord.objectKey }, 'Resume PDF deleted successfully');
      return true;
    } catch (error) {
      logger.error({ err: error, resumeId }, 'Failed to delete resume PDF');
      return false;
    }
  }

  /**
   * Get resume file metadata
   */
  getResumeFileMetadata(resumeId: string): Promise<ResumeFile | null> {
    return prisma.resumeFile.findUnique({
      where: { resumeId },
    });
  }

  /**
   * Check if resume has a stored PDF file
   */
  async hasStoredPDF(resumeId: string): Promise<boolean> {
    const count = await prisma.resumeFile.count({
      where: { resumeId },
    });
    return count > 0;
  }
}

export default new ResumeStorageService();
