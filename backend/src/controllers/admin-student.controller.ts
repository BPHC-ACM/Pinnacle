import type { Request, Response } from 'express';

import adminStudentService from '../services/admin-student-service/admin-student.service';
import markSheetService from '../services/marksheet-service/marksheet.service';
import { AuthError } from '../types/errors.types';
import type { FreezeStudentRequest } from '../types/user-details.types';

const getAdminId = (req: Request): string => {
  const adminId = req.user?.id;
  if (!adminId) {
    throw new AuthError('Admin not authenticated', 'Unauthorized');
  }
  return adminId;
};

/**
 * Freeze or unfreeze a student
 */
export async function freezeStudent(req: Request, res: Response): Promise<void> {
  const adminId = getAdminId(req);
  const data = req.body as FreezeStudentRequest;
  await adminStudentService.freezeStudent(data, adminId);
  res.json({ message: `Student ${data.isFrozen ? 'frozen' : 'unfrozen'} successfully` });
}

/**
 * Delete a student (soft delete)
 */
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const adminId = getAdminId(req);
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  const { reason } = req.body as { reason?: string };
  await adminStudentService.deleteStudent(userId, adminId, reason);
  res.json({ message: 'Student deleted successfully' });
}

/**
 * Restore a deleted student
 */
export async function restoreStudent(req: Request, res: Response): Promise<void> {
  const adminId = getAdminId(req);
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  await adminStudentService.restoreStudent(userId, adminId);
  res.json({ message: 'Student restored successfully' });
}

/**
 * Get all students with filters
 */
export async function getStudents(req: Request, res: Response): Promise<void> {
  const filters = {
    branch: req.query.branch as string | undefined,
    currentYear: req.query.currentYear ? parseInt(req.query.currentYear as string) : undefined,
    isFrozen: req.query.isFrozen === 'true',
    includeDeleted: req.query.includeDeleted === 'true',
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
  };

  const result = await adminStudentService.getStudents(filters);
  res.json(result);
}

/**
 * Bulk freeze students
 */
export async function bulkFreezeStudents(req: Request, res: Response): Promise<void> {
  const adminId = getAdminId(req);
  const { userIds, isFrozen } = req.body as { userIds: string[]; isFrozen: boolean };
  const count = await adminStudentService.bulkFreezeStudents(userIds, isFrozen, adminId);
  res.json({
    message: `${count} student(s) ${isFrozen ? 'frozen' : 'unfrozen'} successfully`,
    count,
  });
}

/**
 * Get marksheets for a specific student (admin only)
 */
export async function getStudentMarkSheets(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  res.json(await markSheetService.getMarkSheetsForUser(userId));
}
