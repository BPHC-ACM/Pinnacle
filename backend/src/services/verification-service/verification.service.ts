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
  experience: 'experience',
  education: 'education',
  project: 'project',
  certification: 'certification',
  skill: 'skill',
} as const;

type ValidItemType = keyof typeof modelMap;

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

  // 2. Perform the update operation using the dynamic model
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
        where: { id: itemId, deletedAt: null },
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
