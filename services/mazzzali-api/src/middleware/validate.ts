import type { Request } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../errors/appError.js';

export function parseRequest<Schema extends ZodType<unknown>>(value: unknown, schema: Schema): Schema['_output'] {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('Request validation failed.', result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })));
  }
  return result.data;
}

export function queryValues(request: Request): Record<string, unknown> {
  return Object.fromEntries(Object.entries(request.query));
}