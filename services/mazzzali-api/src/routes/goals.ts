import { Router } from 'express';
import { GoalUpdateSchema } from '../../../shared/schemas/validation.js';
import { NotFoundError } from '../errors/appError.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseRequest } from '../middleware/validate.js';
import { getServices } from '../services/registry.js';

export const goalsRouter = Router();
goalsRouter.use(authenticate);

goalsRouter.get('/', asyncHandler(async (request, response) => {
  const goal = await getServices().goals.findByUserId(request.user!.id);
  if (!goal) throw new NotFoundError('Weight goal');
  response.status(200).json({ goal });
}));

goalsRouter.put('/', asyncHandler(async (request, response) => {
  const input = parseRequest(request.body, GoalUpdateSchema);
  const goal = await getServices().goals.upsert(request.user!.id, input);
  response.status(200).json({ goal });
}));