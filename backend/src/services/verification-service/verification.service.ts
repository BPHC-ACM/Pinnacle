import { PrismaClient } from '@pinnacle/types';

import prisma from '../../db/client';
import { ValidationError, NotFoundError } from '../../types/errors.types';

interface VerifyItemArgs {
  itemType: string;
  itemId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const modelMap = {
  user: 'user',
  experience: 'experience',
  education: 'education',
  project: 'project',
  certification: 'certification',
  skill: 'skill',
  accomplishment: 'accomplishment',
  positionofresponsibility: 'positionOfResponsibility',
} as const;

type ValidItemType = keyof typeof modelMap;

interface VerifiableItem {
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId: string;
  deletedAt: Date | null;
  verificationDoc?: string | null;
}

interface PrismaModelClient {
  findFirst: (args: {
    where: { id: string; deletedAt?: Date | null };
  }) => Promise<VerifiableItem | null>;
  update: (args: {
    where: { id: string };
    data: { verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' };
  }) => Promise<VerifiableItem>;
  findMany: (args: { where: { userId: string; deletedAt: null } }) => Promise<VerifiableItem[]>;
}

function getModelDelegate(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>,
  type: ValidItemType,
): PrismaModelClient {
  switch (type) {
    case 'user':
      return tx.user as unknown as PrismaModelClient;
    case 'experience':
      return tx.experience as unknown as PrismaModelClient;
    case 'education':
      return tx.education as unknown as PrismaModelClient;
    case 'project':
      return tx.project as unknown as PrismaModelClient;
    case 'certification':
      return tx.certification as unknown as PrismaModelClient;
    case 'skill':
      return tx.skill as unknown as PrismaModelClient;
    case 'accomplishment':
      return tx.accomplishment as unknown as PrismaModelClient;
    case 'positionofresponsibility':
      return tx.positionOfResponsibility as unknown as PrismaModelClient;
  }
}

async function checkAllUserItemsVerified(userId: string): Promise<boolean> {
  const verifiableTypes = Object.keys(modelMap).filter(
    (type) => type !== 'user',
  ) as ValidItemType[];

  const results = await Promise.all(
    verifiableTypes.map(async (itemType) => {
      const model = getModelDelegate(prisma, itemType);

      const items = await model.findMany({
        where: { userId, deletedAt: null },
      });

      return {
        items,
        allVerified: items.every((item) => item.verificationStatus === 'APPROVED'),
      };
    }),
  );

  const totalItems = results.reduce((sum, result) => sum + result.items.length, 0);
  const hasAnyItems = totalItems > 0;
  const allCategoriesVerified = results.every((result) => result.allVerified);

  return hasAnyItems && allCategoriesVerified;
}

async function verifyItem({
  itemType,
  itemId,
  status,
}: VerifyItemArgs): Promise<Record<string, unknown>> {
  const normalizedType = itemType.toLowerCase() as ValidItemType;

  if (!modelMap[normalizedType]) {
    throw new ValidationError(
      `Invalid item type: '${itemType}'. Valid types are: ${Object.keys(modelMap).join(', ')}`,
      `Invalid item type: '${itemType}'`,
    );
  }

  if (normalizedType === 'user' && status === 'APPROVED') {
    const allItemsVerified = await checkAllUserItemsVerified(itemId);
    if (!allItemsVerified) {
      throw new ValidationError(
        'Cannot verify user profile: all experiences, education, skills, projects, and certifications must be verified first',
        'Prerequisites not met',
      );
    }
  }

  const updatedItem = await prisma.$transaction(
    async (
      tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>,
    ): Promise<Record<string, unknown>> => {
      const modelClient = getModelDelegate(tx, normalizedType);

      const itemExists = await modelClient.findFirst({
        where: normalizedType === 'user' ? { id: itemId } : { id: itemId, deletedAt: null },
      });

      if (!itemExists) {
        throw new NotFoundError(
          `${itemType} with ID ${itemId} not found or has been deleted`,
          `${itemType} not found`,
        );
      }

      if (
        status === 'APPROVED' &&
        [
          'experience',
          'education',
          'project',
          'certification',
          'positionofresponsibility',
          'accomplishment',
        ].includes(normalizedType) &&
        !itemExists.verificationDoc
      ) {
        return itemExists as unknown as Record<string, unknown>;
      }

      const updated = await modelClient.update({
        where: { id: itemId },
        data: { verificationStatus: status },
      });

      return updated as unknown as Record<string, unknown>;
    },
  );

  return updatedItem;
}

export const verificationService = {
  verifyItem,
};
