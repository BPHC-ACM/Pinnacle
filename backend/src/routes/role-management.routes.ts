import { Router, type RequestHandler } from 'express';
import { z } from 'zod';

import { authenticateToken } from '@/auth/middleware/auth.middleware';
import {
  grantRole,
  revokeRole,
  getAdminUsers,
  searchUsers,
} from '@/controllers/role-management.controller';
import { requireSPT } from '@/middleware/role.middleware';
import { validateBody } from '@/middleware/validate.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken as RequestHandler);

// Schema validation
const grantRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['ADMIN', 'JPT', 'SPT']).refine((val) => ['ADMIN', 'JPT', 'SPT'].includes(val), {
    message: 'Role must be ADMIN, JPT, or SPT',
  }),
});

const revokeRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// ==================== ROLE MANAGEMENT (SPT Only) ====================

// GET /api/admin/roles - Get all users with admin roles
router.get('/', requireSPT as RequestHandler, getAdminUsers);

// GET /api/admin/roles/search - Search for users to grant roles to
router.get('/search', requireSPT as RequestHandler, searchUsers);

// POST /api/admin/roles/grant - Grant a role to a user (SPT only)
router.post('/grant', requireSPT as RequestHandler, validateBody(grantRoleSchema), grantRole);

// POST /api/admin/roles/revoke - Revoke a role from a user (SPT only)
router.post('/revoke', requireSPT as RequestHandler, validateBody(revokeRoleSchema), revokeRole);

export default router;
