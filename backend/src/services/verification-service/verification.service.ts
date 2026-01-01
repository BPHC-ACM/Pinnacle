import type { PrismaClient } from '@pinnacle/types';

import prisma from '../../db/client';
import { ValidationError, NotFoundError } from '../../types/errors.types';

interface VerifyItemArgs {
  itemType: string;
  itemId: string;
  status: boolean;
}

const modelMap = {
  user: 'user',
  experience: 'experience',
  education: 'education',
  project: 'project',
  certification: 'certification',
  skill: 'skill',
} as const;

type ValidItemType = keyof typeof modelMap;

interface VerifiableItem {
  isVerified: boolean;
  userId: string;
  deletedAt: Date | null;
  verificationDoc?: string | null;
}

interface PrismaModelClient {
  findFirst: (args: unknown) => Promise<VerifiableItem | null>;
  update: (args: unknown) => Promise<VerifiableItem>;
}

async function checkAllUserItemsVerified(userId: string): Promise<boolean> {
  const verifiableTypes = Object.keys(modelMap).filter(
    (type) => type !== 'user',
  ) as ValidItemType[];

  const results = await Promise.all(
    verifiableTypes.map(async (itemType) => {
      const model = prisma[itemType as keyof typeof prisma] as {
        findMany: (args: unknown) => Promise<VerifiableItem[]>;
      };

      const items = await model.findMany({
        where: { userId, deletedAt: null },
      });

      return {
        items,
        allVerified: items.every((item) => item.isVerified),
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

  if (normalizedType === 'user' && status === true) {
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
      const modelClient = tx[normalizedType] as unknown as PrismaModelClient;

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
        status === true &&
        [
          'experience',
          'education',
          'project',
          'certification',
          'position_of_responsibility',
        ].includes(normalizedType) &&
        !itemExists.verificationDoc
      ) {
        return itemExists as unknown as Record<string, unknown>;
      }

      const updated = await modelClient.update({
        where: { id: itemId },
        data: { isVerified: status },
      });

      return updated as unknown as Record<string, unknown>;
    },
  );

  return updatedItem;
}

export const verificationService = {
  verifyItem,
};
