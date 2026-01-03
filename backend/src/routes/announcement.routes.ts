import { Router } from 'express';

import { isAdmin } from '../auth/middleware/admin.middleware';
import { authenticateToken } from '../auth/middleware/auth.middleware';
import { createAnnouncement, getAnnouncements } from '../controllers/announcement.controller';

const router = Router();

// Get all announcements (Authenticated users)
router.get('/', authenticateToken, getAnnouncements);

// Create announcement (Admin only)
router.post('/', authenticateToken, isAdmin, createAnnouncement);

export default router;
