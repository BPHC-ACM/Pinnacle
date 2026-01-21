import express from 'express';

import { authenticateToken } from '../auth/middleware';
import * as adminStudentController from '../controllers/admin-student.controller';
import { requireSuperAdmin, requireAdmin } from '../middleware/role.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { freezeStudentSchema } from '../types/user-details.types';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/students - Get all students with filters
router.get('/students', adminStudentController.getStudents);

// POST /api/admin/students/freeze - Freeze or unfreeze a student
router.post(
  '/students/freeze',
  validateBody(freezeStudentSchema),
  adminStudentController.freezeStudent,
);

// POST /api/admin/students/bulk-freeze - Bulk freeze/unfreeze students
router.post('/students/bulk-freeze', adminStudentController.bulkFreezeStudents);

// DELETE /api/admin/students/:userId - Soft delete a student (super admin only)
router.delete('/students/:userId', requireSuperAdmin, adminStudentController.deleteStudent);

// POST /api/admin/students/:userId/restore - Restore a deleted student (super admin only)
router.post('/students/:userId/restore', requireSuperAdmin, adminStudentController.restoreStudent);

// GET /api/admin/students/:userId/marksheets - Get student's marksheets
router.get('/students/:userId/marksheets', adminStudentController.getStudentMarkSheets);

// GET /api/admin/students/:userId/profile - Get student's complete profile
router.get('/students/:userId/profile', adminStudentController.getStudentProfile);

export default router;
