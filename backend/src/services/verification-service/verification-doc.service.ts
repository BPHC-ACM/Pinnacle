import { prisma } from '@repo/database';

import { logger } from '../../config/logger.config';
import { minioClient } from '../../db/minio';
import { ForbiddenError, NotFoundError, ValidationError } from '../../types/errors.types';

const ITEM_CONFIG = {
  experience: {
    bucket: 'experience-docs',
    model: prisma.experience,
  },
  education: {
    bucket: 'education-docs',
    model: prisma.education,
  },
  project: {
    bucket: 'project-docs',
    model: prisma.project,
  },
  certification: {
    bucket: 'certification-docs',
    model: prisma.certification,
  },
  accomplishment: {
    bucket: 'accomplishment-docs',
    model: prisma.accomplishment,
  },
  position_of_responsibility: {
    bucket: 'position-of-responsibility-docs',
    model: prisma.positionOfResponsibility,
  },
} as const;

type ItemType = keyof typeof ITEM_CONFIG;

interface DocUserItem {
  id: string;
  userId: string;
  verificationDoc: string | null;
}

interface PrismaModel<T> {
  findUnique(args: { where: { id: string } }): Promise<T | null>;
  update(args: { where: { id: string }; data: Partial<T> }): Promise<T>;
}

function getItemConfig<T extends ItemType>(
  itemType: T,
): {
  bucket: string;
  model: PrismaModel<DocUserItem>;
} {
  const config = ITEM_CONFIG[itemType];

  if (!config) {
    throw new ValidationError(`Invalid item type: '${itemType}'`, 'Invalid item type');
  }

  return config;
}

interface UploadDocArgs<T extends ItemType> {
  userId: string;
  itemType: T;
  itemId: string;
  fileBuffer: Buffer;
  mimeType: string;
  startEndBytes?: number;
}

interface GetDocArgs<T extends ItemType> {
  requestingUserId: string;
  requestingUserRole: 'JPT' | 'SPT' | 'USER';
  itemType: T;
  itemId: string;
}

interface RemoveDocArgs<T extends ItemType> {
  userId: string;
  itemType: T;
  itemId: string;
}

async function uploadDocument<T extends ItemType>({
  userId,
  itemType,
  itemId,
  fileBuffer,
  mimeType,
  startEndBytes,
}: UploadDocArgs<T>): Promise<{ url: string }> {
  const { bucket, model } = getItemConfig(itemType);

  const item = await model.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new NotFoundError(`${itemType} not found`, 'Item not found');
  }

  if (item.userId !== userId) {
    throw new ForbiddenError('You can only upload documents for your own items', 'Access denied');
  }

  const objectName = `${userId}/${itemId}/${Date.now()}`;

  try {
    await minioClient.putObject(bucket, objectName, fileBuffer, startEndBytes, {
      'Content-Type': mimeType,
    });

    await model.update({
      where: { id: itemId },
      data: { verificationDoc: objectName },
    });

    logger.info({ userId, itemType, itemId, bucket, objectName }, 'Verification document uploaded');

    return { url: objectName };
  } catch (error) {
    logger.error({ error, userId, itemType, itemId }, 'Failed to upload verification document');
    throw new Error('Failed to upload document');
  }
}

async function getDocument<T extends ItemType>({
  requestingUserId,
  requestingUserRole,
  itemType,
  itemId,
}: GetDocArgs<T>): Promise<string> {
  const { bucket, model } = getItemConfig(itemType);

  const item = await model.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new NotFoundError(`${itemType} not found`, 'Item not found');
  }

  if (item.userId !== requestingUserId && !['JPT', 'SPT'].includes(requestingUserRole)) {
    throw new ForbiddenError('Access denied', 'Access denied');
  }

  if (!item.verificationDoc) {
    throw new NotFoundError('No verification document found for this item', 'Document not found');
  }

  try {
    return await minioClient.presignedGetObject(bucket, item.verificationDoc, 24 * 60 * 60);
  } catch (error) {
    logger.error({ error, itemType, itemId }, 'Failed to generate presigned URL');
    throw new Error('Failed to retrieve document');
  }
}

async function removeDocument<T extends ItemType>({
  userId,
  itemType,
  itemId,
}: RemoveDocArgs<T>): Promise<void> {
  const { bucket, model } = getItemConfig(itemType);

  const item = await model.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new NotFoundError(`${itemType} not found`, 'Item not found');
  }

  if (item.userId !== userId) {
    throw new ForbiddenError('You can only remove documents for your own items', 'Access denied');
  }

  if (!item.verificationDoc) return;

  try {
    await minioClient.removeObject(bucket, item.verificationDoc);

    await model.update({
      where: { id: itemId },
      data: { verificationDoc: null },
    });

    logger.info({ userId, itemType, itemId }, 'Verification document removed');
  } catch (error) {
    logger.error({ error, itemId }, 'Failed to remove document');
    throw new Error('Failed to remove document');
  }
}

export const verificationDocService = {
  uploadDocument,
  getDocument,
  removeDocument,
};
