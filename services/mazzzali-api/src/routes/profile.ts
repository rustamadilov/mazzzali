import { Router } from 'express';
import { ProfileUpdateSchema } from '../../../shared/schemas/validation.js';
import { NotFoundError } from '../errors/appError.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseRequest } from '../middleware/validate.js';
import { getServices } from '../services/registry.js';

export const profileRouter = Router();
profileRouter.use(authenticate);

profileRouter.get('/me', asyncHandler(async (request, response) => {
  const user = await getServices().users.findById(request.user!.id);
  if (!user) throw new NotFoundError('Profile');
  response.status(200).json({ user, focus: user.focus, categories: user.categories });
}));

profileRouter.put('/me', asyncHandler(async (request, response) => {
  const input = parseRequest(request.body, ProfileUpdateSchema);
  const user = await getServices().users.update(request.user!.id, input);
  if (!user) throw new NotFoundError('Profile');
  response.status(200).json({ user, focus: user.focus, categories: user.categories });
}));