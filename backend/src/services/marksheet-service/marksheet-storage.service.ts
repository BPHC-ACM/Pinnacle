import crypto from 'crypto';

import { logger } from '../../config/logger.config';
import { MinioBucketStorage } from '../storage-service/minio-service';

const MARKSHEET_BUCKET = 'marksheets';
const marksheetStorage = new MinioBucketStorage(MARKSHEET_BUCKET);

export class MarksheetStorageService {
  /**
   * Upload a marksheet screenshot/image to Minio
   */
  async uploadMarksheetImage(
    userId: string,
    imageBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ objectKey: string; url: string; size: number }> {
    try {
      // Generate unique object key
      const timestamp = Date.now();
      const hash = crypto.createHash('md5').update(imageBuffer).digest('hex').substring(0, 8);
      const sanitizedFileName = fileName.replace(/\s+/g, '_');
      const objectKey = `${userId}/${timestamp}-${hash}-${sanitizedFileName}`;

      // Upload to Minio
      const { size } = await marksheetStorage.upload(objectKey, imageBuffer, mimeType);

      // Generate a presigned URL valid for 7 days
      const url = await marksheetStorage.getDownloadUrl(objectKey, 7 * 24 * 3600);

      logger.info({ userId, objectKey, size }, 'Marksheet image uploaded successfully');

      return {
        objectKey,
        url,
        size,
      };
    } catch (error) {
      logger.error({ err: error, userId }, 'Failed to upload marksheet image');
      throw new Error('Failed to upload marksheet image');
    }
  }

  /**
   * Get download URL for a marksheet image
   */
  async getMarksheetDownloadUrl(
    objectKey: string,
    expiresInSeconds = 7 * 24 * 3600,
  ): Promise<string> {
    try {
      const downloadUrl = await marksheetStorage.getDownloadUrl(objectKey, expiresInSeconds);
      return downloadUrl;
    } catch (error) {
      logger.error({ err: error, objectKey }, 'Failed to get marksheet download URL');
      throw new Error('Failed to get marksheet download URL');
    }
  }

  /**
   * Delete marksheet image from storage
   */
  async deleteMarksheetImage(objectKey: string): Promise<boolean> {
    try {
      await marksheetStorage.delete(objectKey);
      logger.info({ objectKey }, 'Marksheet image deleted successfully');
      return true;
    } catch (error) {
      logger.error({ err: error, objectKey }, 'Failed to delete marksheet image');
      return false;
    }
  }

  /**
   * Extract object key from URL
   */
  extractObjectKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Remove bucket name and get the rest of the path
      const bucketIndex = pathParts.indexOf(MARKSHEET_BUCKET);
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }
}

export default new MarksheetStorageService();
