import crypto from 'crypto';

import { logger } from '@/config/logger.config';
import { MinioBucketStorage } from '@/services/storage-service/minio-service';

// Bucket names
const PROFILE_PICTURES_BUCKET = 'profile-pictures';
const COMPANY_LOGOS_BUCKET = 'company-logos';
const JOB_DOCUMENTS_BUCKET = 'job-documents';

// Storage instances
const profilePicturesStorage = new MinioBucketStorage(PROFILE_PICTURES_BUCKET);
const companyLogosStorage = new MinioBucketStorage(COMPANY_LOGOS_BUCKET);
const jobDocumentsStorage = new MinioBucketStorage(JOB_DOCUMENTS_BUCKET);

// Allowed MIME types
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export class ImageStorageService {
  /**
   * Validate file for image upload
   */
  private validateImageFile(buffer: Buffer, mimeType: string): void {
    if (!IMAGE_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Invalid file type. Allowed: ${IMAGE_MIME_TYPES.join(', ')}`);
    }

    if (buffer.length > MAX_IMAGE_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    }
  }

  /**
   * Validate file for document upload
   */
  private validateDocumentFile(buffer: Buffer, mimeType: string): void {
    if (!DOCUMENT_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Invalid file type. Allowed: ${DOCUMENT_MIME_TYPES.join(', ')}`);
    }

    if (buffer.length > MAX_DOCUMENT_SIZE) {
      throw new Error(`File too large. Maximum size: ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`);
    }
  }

  /**
   * Generate unique object key
   */
  private generateObjectKey(entityId: string, fileName: string, buffer: Buffer): string {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${entityId}/${timestamp}-${hash}-${sanitizedFileName}`;
  }

  /**
   * Upload user profile picture
   */
  async uploadProfilePicture(
    userId: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ url: string; size: number }> {
    try {
      this.validateImageFile(buffer, mimeType);
      const objectKey = this.generateObjectKey(userId, fileName, buffer);

      const { size } = await profilePicturesStorage.upload(objectKey, buffer, mimeType);
      const url = await profilePicturesStorage.getDownloadUrl(objectKey, 365 * 24 * 3600); // 1 year

      logger.info({ userId, objectKey, size }, 'Profile picture uploaded');
      return { url, size };
    } catch (error) {
      logger.error({ err: error, userId }, 'Failed to upload profile picture');
      throw error;
    }
  }

  /**
   * Delete user profile picture
   */
  async deleteProfilePicture(objectKey: string): Promise<void> {
    try {
      await profilePicturesStorage.delete(objectKey);
      logger.info({ objectKey }, 'Profile picture deleted');
    } catch (error) {
      logger.error({ err: error, objectKey }, 'Failed to delete profile picture');
      throw error;
    }
  }

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(
    companyId: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ url: string; size: number }> {
    try {
      this.validateImageFile(buffer, mimeType);
      const objectKey = this.generateObjectKey(companyId, fileName, buffer);

      const { size } = await companyLogosStorage.upload(objectKey, buffer, mimeType);
      const url = await companyLogosStorage.getDownloadUrl(objectKey, 365 * 24 * 3600); // 1 year

      logger.info({ companyId, objectKey, size }, 'Company logo uploaded');
      return { url, size };
    } catch (error) {
      logger.error({ err: error, companyId }, 'Failed to upload company logo');
      throw error;
    }
  }

  /**
   * Delete company logo
   */
  async deleteCompanyLogo(objectKey: string): Promise<void> {
    try {
      await companyLogosStorage.delete(objectKey);
      logger.info({ objectKey }, 'Company logo deleted');
    } catch (error) {
      logger.error({ err: error, objectKey }, 'Failed to delete company logo');
      throw error;
    }
  }

  /**
   * Upload job description document
   */
  async uploadJobDocument(
    jobId: string,
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ url: string; size: number }> {
    try {
      this.validateDocumentFile(buffer, mimeType);
      const objectKey = this.generateObjectKey(jobId, fileName, buffer);

      const { size } = await jobDocumentsStorage.upload(objectKey, buffer, mimeType);
      const url = await jobDocumentsStorage.getDownloadUrl(objectKey, 365 * 24 * 3600); // 1 year

      logger.info({ jobId, objectKey, size }, 'Job document uploaded');
      return { url, size };
    } catch (error) {
      logger.error({ err: error, jobId }, 'Failed to upload job document');
      throw error;
    }
  }

  /**
   * Delete job document
   */
  async deleteJobDocument(objectKey: string): Promise<void> {
    try {
      await jobDocumentsStorage.delete(objectKey);
      logger.info({ objectKey }, 'Job document deleted');
    } catch (error) {
      logger.error({ err: error, objectKey }, 'Failed to delete job document');
      throw error;
    }
  }

  /**
   * Extract object key from URL
   */
  extractObjectKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Remove first empty element and bucket name
      return pathParts.slice(2).join('/');
    } catch {
      return null;
    }
  }
}

export default new ImageStorageService();
