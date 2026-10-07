import { Router } from 'express';
import { LoginSchema, RegisterSchema } from '../../../shared/schemas/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseRequest } from '../middleware/validate.js';
import { getServices } from '../services/registry.js';

export const authRouter = Router();
const sessionCookie = 'mazzzali_session';
const sessionOptions = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 2 * 60 * 60 * 1000 };

authRouter.post('/register', asyncHandler(async (request, response) => {
  const input = parseRequest(request.body, RegisterSchema);
  const session = await getServices().auth.register(input);
  response.cookie(sessionCookie, session.token, { ...sessionOptions, secure: process.env.AZURE_FUNCTIONS_ENVIRONMENT !== 'Development' });
  response.status(201).json({ user: session.user });
}));

authRouter.post('/login', asyncHandler(async (request, response) => {
  const input = parseRequest(request.body, LoginSchema);
  const session = await getServices().auth.login(input);
  response.cookie(sessionCookie, session.token, { ...sessionOptions, secure: process.env.AZURE_FUNCTIONS_ENVIRONMENT !== 'Development' });
  response.status(200).json({ user: session.user });
}));

authRouter.post('/logout', (_request, response) => {
  response.clearCookie(sessionCookie, { ...sessionOptions, secure: process.env.AZURE_FUNCTIONS_ENVIRONMENT !== 'Development' });
  response.status(204).end();
});