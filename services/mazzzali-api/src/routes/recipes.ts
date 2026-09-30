import { Router } from 'express';
import { RecipeIdSchema, RecipeQuerySchema } from '../../../shared/schemas/validation.js';
import { NotFoundError } from '../errors/appError.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseRequest, queryValues } from '../middleware/validate.js';
import { getServices } from '../services/registry.js';

export const recipesRouter = Router();
recipesRouter.use(authenticate);

recipesRouter.get('/', asyncHandler(async (request, response) => {
  const query = parseRequest(queryValues(request), RecipeQuerySchema);
  response.status(200).json(await getServices().recipes.list(query));
}));

recipesRouter.get('/:recipeId', asyncHandler(async (request, response) => {
  const { recipeId } = parseRequest(request.params, RecipeIdSchema);
  const recipe = await getServices().recipes.findById(recipeId);
  if (!recipe) throw new NotFoundError('Recipe');
  response.status(200).json({ recipe });
}));