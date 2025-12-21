// POST /api/users/login
// Body: { email: string, password: string }
// Returns: JWT token
import { Router } from 'express';

import {
  googleLogin,
  googleCallback,
  refreshAccessToken,
  getMe,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Public routes (with rate limiting to prevent brute-force attacks)
router.get('/google/login', authRateLimiter, googleLogin);
router.get('/google/callback', authRateLimiter, googleCallback);
router.post('/refresh', authRateLimiter, refreshAccessToken);

// Protected route (requires JWT)
router.get('/me', authenticateToken, getMe);

export default router;
