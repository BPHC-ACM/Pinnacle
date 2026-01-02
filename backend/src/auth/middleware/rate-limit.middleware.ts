import type { RequestHandler } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

/*
 * Note: express-rate-limit v8 has type compatibility issues with Express v5.
 * The middleware works correctly at runtime, but TypeScript cannot reconcile the types.
 * We cast to RequestHandler to maintain type safety while bypassing the compatibility issues.
 * See: https://github.com/express-rate-limit/express-rate-limit/issues/428
 */

// Rate limiter for authentication endpoints.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown'),
}) as unknown as RequestHandler;

// Rate limiter for sensitive endpoints (e.g., applications, profile updates).
export const sensitiveEndpointRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many sensitive requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown'),
}) as unknown as RequestHandler;

// General-purpose rate limiter for most API endpoints.
export const generalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown'),
}) as unknown as RequestHandler;

// Strict rate limiter for administrative actions.
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many admin requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown'),
}) as unknown as RequestHandler;
