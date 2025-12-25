import { logger } from '@/config/logger.config';
import { minioClient } from '@/db/minio';

const RESUME_BUCKET = 'resumes';

/**
 * Initialize Minio storage by ensuring required buckets exist
 */
export async function initializeStorage(): Promise<void> {
  try {
    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(RESUME_BUCKET);

    if (!bucketExists) {
      // Create bucket
      await minioClient.makeBucket(RESUME_BUCKET, 'us-east-1');
      logger.info({ bucket: RESUME_BUCKET }, 'Minio bucket created successfully');
    } else {
      logger.info({ bucket: RESUME_BUCKET }, 'Minio bucket already exists');
    }
  } catch (error) {
    logger.error({ err: error, bucket: RESUME_BUCKET }, 'Failed to initialize Minio storage');
    // Don't throw - allow app to start even if Minio is unavailable
  }
}
