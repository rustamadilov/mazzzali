import type { ErrorCode } from '../../../shared/types/api.js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown = null) { super(422, 'VALIDATION_ERROR', message, details); }
}
export class NotFoundError extends AppError {
  constructor(resource: string) { super(404, 'NOT_FOUND', `${resource} was not found.`); }
}
export class ConflictError extends AppError {
  constructor(message: string) { super(409, 'CONFLICT', message); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') { super(401, 'UNAUTHORIZED', message); }
}