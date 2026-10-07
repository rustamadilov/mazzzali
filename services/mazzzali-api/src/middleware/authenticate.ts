import type { NextFunction, Request, Response } from 'express';
import type { User } from '../../../shared/types/entities.js';
import { UnauthorizedError } from '../errors/appError.js';
import { getServices } from '../services/registry.js';

declare global {
  namespace Express {
    interface Request { user?: User }
  }
}

export async function authenticate(request: Request, _response: Response, next: NextFunction): Promise<void> {
  const cookie = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('mazzzali_session='));
  const cookieToken = cookie?.slice('mazzzali_session='.length);
  const bearer = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = cookieToken || bearer;
  if (!token) return next(new UnauthorizedError());
  try {
    request.user = await getServices().auth.authenticate(token);
    next();
  } catch (error) {
    next(error);
  }
}