import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from './appError.js';
import { logger } from '../logger.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }
  if (error instanceof ZodError) {
    response.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
      },
    });
    return;
  }
  if (isMalformedJson(error)) {
    response.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON.', details: null },
    });
    return;
  }
  logger.error({ err: error }, 'Unhandled API error');
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred.',
      details: null,
    },
  });
};

function isMalformedJson(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.parse.failed';
}