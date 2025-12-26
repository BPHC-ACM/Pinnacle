export interface BucketStorage {
  upload(key: string, body: Buffer, contentType: string): Promise<{ key: string; size: number }>;

  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  getUploadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  delete(key: string): Promise<void>;
}
