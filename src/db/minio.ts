import { Client } from 'minio';

type MinioConfig = ConstructorParameters<typeof Client>[0];

const minioConfig: MinioConfig = {
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY ?? 'minio',
  secretKey: process.env.MINIO_SECRET_KEY ?? 'minio123',
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const minioClient = new Client(minioConfig);
