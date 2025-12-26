import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodIssue } from 'zod';
import { ZodError } from 'zod';

import { ValidationError } from '../types/errors.types';

// Middleware to validate request body against a Zod schema
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(
          (err: ZodIssue) => `${err.path.join('.')}: ${err.message}`,
        );
        throw new ValidationError(
          `Validation failed: ${errorMessages.join(', ')}`,
          `Invalid request data: ${errorMessages.join('; ')}`,
        );
      }
      next(error);
    }
  };
};
