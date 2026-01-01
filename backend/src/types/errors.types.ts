export abstract class AppError extends Error {
  abstract readonly name: string;
  abstract readonly statusCode: number;

  readonly publicMessage: string;

  constructor(message: string, publicMessage: string, cause?: unknown) {
    //This message is strictly for internal logging do not put sensitive data here
    super(message, { cause });
    this.publicMessage = publicMessage;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  name = 'ValidationError';
  statusCode = 400;
}

export class NotFoundError extends AppError {
  name = 'NotFoundError';
  statusCode = 404;
}

export class AuthError extends AppError {
  name = 'AuthError';
  statusCode = 401;
}

export class ForbiddenError extends AppError {
  name = 'ForbiddenError';
  statusCode = 403;
}

export class InternalError extends AppError {
  name = 'InternalError';
  statusCode = 500;
}
