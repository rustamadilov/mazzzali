import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getServices } from '../services/registry.js';

export const healthRouter = Router();

healthRouter.get('/', asyncHandler(async (_request, response) => {
  const services = getServices();
  const [database, blobStorage] = await Promise.all([
    services.database.healthCheck(),
    services.blobStorage.healthCheck(),
  ]);
  const checks = {
    postgresql: database ? 'available' as const : 'unavailable' as const,
    blobStorage: blobStorage ? 'available' as const : 'unavailable' as const,
  };
  const available = Object.values(checks).filter((state) => state === 'available').length;
  const status = available === 2 ? 'healthy' : available > 0 ? 'degraded' : 'unhealthy';
  response.status(status === 'unhealthy' ? 503 : 200).json({ status, services: checks });
}));