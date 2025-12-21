import type { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

// Rate limiter for authentication endpoints.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown',
});

// Rate limiter for sensitive endpoints (e.g., applications, profile updates).
export const sensitiveEndpointRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many sensitive requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown',
});

// General-purpose rate limiter for most API endpoints.
export const generalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown',
});

// Strict rate limiter for administrative actions.
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many admin requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown',
});
