import type { Request, Response, NextFunction } from 'express';

import { AppError } from '@/types/errors.types';

export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  void _next;

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      msg: err.publicMessage,
    });

    console.error(err);
    return;
  }
  //   Throw a 500 by default in case of improper error handling
  res.status(500).json({
    error: 'Internal server error',
    msg: 'Something went wrong',
  });

  console.error('Improper use of errors please throw an instance of AppError');
  console.error(err);
  return;
}
