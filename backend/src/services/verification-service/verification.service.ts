import type { PrismaClient } from '@prisma/client';

import prisma from '../../db/client';
import { ValidationError, NotFoundError } from '../../types/errors.types';

interface VerifyItemArgs {
  itemType: string;
  itemId: string;
  status: boolean;
}

// A mapping of our URL param to the actual Prisma model client
const modelMap = {
  user: 'user',
  experience: 'experience',
  education: 'education',
  project: 'project',
  certification: 'certification',
  skill: 'skill',
} as const;

type ValidItemType = keyof typeof modelMap;

// Type for items that have the isVerified field
interface VerifiableItem {
  isVerified: boolean;
  userId: string;
  deletedAt: Date | null;
}

// Checks if all user profile items are verified
async function checkAllUserItemsVerified(userId: string): Promise<boolean> {
  // Get all verifiable item types (exclude 'user' itself)
  const verifiableTypes = Object.keys(modelMap).filter(
    (type) => type !== 'user',
  ) as ValidItemType[];

  // Dynamically fetch and check all verifiable item types
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

  // Check if at least one category has items (can't verify empty profile)
  const totalItems = results.reduce((sum, result) => sum + result.items.length, 0);
  const hasAnyItems = totalItems > 0;

  // Check if all categories with items are fully verified
  const allCategoriesVerified = results.every((result) => result.allVerified);

  return hasAnyItems && allCategoriesVerified;
}

async function verifyItem({
  itemType,
  itemId,
  status,
}: VerifyItemArgs): Promise<Record<string, unknown>> {
  // 1. Validate the itemType to ensure it's a valid, verifiable model
  const normalizedType = itemType.toLowerCase() as ValidItemType;

  if (!modelMap[normalizedType]) {
    throw new ValidationError(
      `Invalid item type: '${itemType}'. Valid types are: ${Object.keys(modelMap).join(', ')}`,
      `Invalid item type: '${itemType}'`,
    );
  }
  // Special handling for user profile verification
  if (normalizedType === 'user' && status === true) {
    // For user profile, we can only verify if ALL related items are verified
    const allItemsVerified = await checkAllUserItemsVerified(itemId);
    if (!allItemsVerified) {
      throw new ValidationError(
        'Cannot verify user profile: all experiences, education, skills, projects, and certifications must be verified first',
        'Prerequisites not met',
      );
    }
  }

  // Perform the update operation using the dynamic model
  const updatedItem = await prisma.$transaction(
    async (
      tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>,
    ): Promise<Record<string, unknown>> => {
      // Access the correct model from the transaction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      const modelClient = tx[normalizedType] as any;

      // First, check if the item exists and is not soft-deleted
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const itemExists = await modelClient.findFirst({
        where: normalizedType === 'user' ? { id: itemId } : { id: itemId, deletedAt: null },
      });

      if (!itemExists) {
        throw new NotFoundError(
          `${itemType} with ID ${itemId} not found or has been deleted`,
          `${itemType} not found`,
        );
      }

      // Then, perform the update
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const updated = await modelClient.update({
        where: { id: itemId },
        data: {
          isVerified: status,
        },
      });

      return updated as Record<string, unknown>;
    },
  );

  return updatedItem;
}

export const verificationService = {
  verifyItem,
};
