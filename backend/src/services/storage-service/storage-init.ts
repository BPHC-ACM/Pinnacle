import { logger } from '@/config/logger.config';
import { minioClient } from '@/db/minio';

const BUCKETS = [
  'resumes',
  'profile-pictures',
  'company-logos',
  'job-documents',
  'por-verification',
  'experience_docs',
  'education_docs',
  'project_docs',
  'certification_docs',
  'accomplishment_docs',
  'position_of_responsibility_docs',
];

/**
 * Initialize Minio storage by ensuring required buckets exist
 */
export async function initializeStorage(): Promise<void> {
  for (const bucket of BUCKETS) {
    try {
      const bucketExists = await minioClient.bucketExists(bucket);

      if (!bucketExists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        logger.info({ bucket }, 'Minio bucket created successfully');
      } else {
        logger.info({ bucket }, 'Minio bucket already exists');
      }
    } catch (error) {
      logger.error({ err: error, bucket }, 'Failed to initialize Minio bucket');
      // Don't throw - allow app to start even if Minio is unavailable
    }
  }
}
