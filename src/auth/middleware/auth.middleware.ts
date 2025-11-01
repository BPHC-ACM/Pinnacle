import { Request, Response, NextFunction } from 'express';

import { verifyAccessToken } from '../utils/jwt.utils';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request (you'd fetch full user from DB in production)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: '', // You'd fetch from DB
      googleId: '',
    };

    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
