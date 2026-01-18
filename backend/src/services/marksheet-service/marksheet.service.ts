import { logger } from '../../config/logger.config';
import { prisma } from '../../db/client';
import { NotFoundError } from '../../types/errors.types';
import type { MarkSheet, UploadMarkSheetRequest } from '../../types/user-details.types';
import marksheetStorageService from './marksheet-storage.service';

class MarkSheetService {
  /**
   * Upload or update a marksheet for a user
   */
  async uploadMarkSheet(
    userId: string,
    fileUrl: string,
    data: UploadMarkSheetRequest,
  ): Promise<MarkSheet> {
    try {
      // Check if marksheet already exists for this term and academic year
      const existing = await prisma.markSheet.findFirst({
        where: {
          userId,
          term: data.term,
          academicYear: data.academicYear,
        },
      });

      if (existing) {
        // Delete old file from storage if it exists
        const oldObjectKey = marksheetStorageService.extractObjectKeyFromUrl(existing.fileUrl);
        if (oldObjectKey) {
          await marksheetStorageService.deleteMarksheetImage(oldObjectKey);
        }

        // Update existing marksheet
        const updated = await prisma.markSheet.update({
          where: { id: existing.id },
          data: {
            fileUrl,
            fileName: data.fileName,
          },
        });

        logger.info(
          { userId, markSheetId: updated.id, term: data.term },
          'Marksheet updated successfully',
        );

        return updated;
      }

      // Create new marksheet
      const markSheet = await prisma.markSheet.create({
        data: {
          userId,
          term: data.term,
          academicYear: data.academicYear,
          fileUrl,
          fileName: data.fileName,
        },
      });

      logger.info(
        { userId, markSheetId: markSheet.id, term: data.term },
        'Marksheet uploaded successfully',
      );

      return markSheet;
    } catch (error) {
      logger.error({ err: error, userId }, 'Error uploading marksheet');
      throw error;
    }
  }

  /**
   * Get all marksheets for a user
   */
  async getUserMarkSheets(userId: string): Promise<MarkSheet[]> {
    try {
      const markSheets = await prisma.markSheet.findMany({
        where: { userId },
        orderBy: [{ academicYear: 'desc' }, { term: 'asc' }],
      });

      return markSheets;
    } catch (error) {
      logger.error({ err: error, userId }, 'Error fetching user marksheets');
      throw error;
    }
  }

  /**
   * Get a specific marksheet by ID
   */
  async getMarkSheetById(id: string, userId: string): Promise<MarkSheet> {
    try {
      const markSheet = await prisma.markSheet.findFirst({
        where: { id, userId },
      });

      if (!markSheet) {
        throw new NotFoundError('Marksheet not found', 'Marksheet not found');
      }

      return markSheet;
    } catch (error) {
      logger.error({ err: error, markSheetId: id }, 'Error fetching marksheet');
      throw error;
    }
  }

  /**
   * Delete a marksheet
   */
  async deleteMarkSheet(id: string, userId: string): Promise<void> {
    try {
      const markSheet = await prisma.markSheet.findFirst({
        where: { id, userId },
      });

      if (!markSheet) {
        throw new NotFoundError('Marksheet not found', 'Marksheet not found');
      }

      // Extract object key from URL and delete from storage
      const objectKey = marksheetStorageService.extractObjectKeyFromUrl(markSheet.fileUrl);
      if (objectKey) {
        await marksheetStorageService.deleteMarksheetImage(objectKey);
      }

      await prisma.markSheet.delete({
        where: { id },
      });

      logger.info({ markSheetId: id, userId }, 'Marksheet deleted successfully');
    } catch (error) {
      logger.error({ err: error, markSheetId: id }, 'Error deleting marksheet');
      throw error;
    }
  }

  /**
   * Admin: Get marksheets for any user
   */
  async getMarkSheetsForUser(userId: string): Promise<MarkSheet[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found', 'User not found');
      }

      return this.getUserMarkSheets(userId);
    } catch (error) {
      logger.error({ err: error, userId }, 'Error fetching marksheets for user');
      throw error;
    }
  }
}

export default new MarkSheetService();
