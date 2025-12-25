import { minioClient } from '@/db/minio';
import { BucketStorage } from '@/types/storage.types';

//Abstracts interacting with a minio bucket
//usage new MinioBuckerStorage("bucket-name")

export class MinioBucketStorage implements BucketStorage {
  constructor(private readonly bucket: string) {}

  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ key: string; size: number }> {
    await minioClient.putObject(this.bucket, key, body, body.length, {
      'Content-Type': contentType,
    });

    return {
      key,
      size: body.length,
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    return minioClient.presignedGetObject(this.bucket, key, expiresInSeconds);
  }

  async getUploadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    return minioClient.presignedPutObject(this.bucket, key, expiresInSeconds);
  }

  async delete(key: string): Promise<void> {
    await minioClient.removeObject(this.bucket, key);
  }
}
