import express from 'express';
import { errorHandler } from './errors/errorHandler.js';
import { logger } from './logger.js';
import { authRouter } from './routes/auth.js';
import { goalsRouter } from './routes/goals.js';
import { healthRouter } from './routes/health.js';
import { profileRouter } from './routes/profile.js';
import { recipesRouter } from './routes/recipes.js';
import { openApiDocument } from './openapi.js';

export const expressApp = express();
expressApp.disable('x-powered-by');
expressApp.use(express.json({ limit: '1mb' }));
expressApp.use((request, response, next) => {
  const startedAt = Date.now();
  response.on('finish', () => logger.info({ method: request.method, path: request.path, statusCode: response.statusCode, durationMs: Date.now() - startedAt }, 'HTTP request'));
  next();
});

expressApp.get('/api/openapi.json', (_request, response) => response.status(200).json(openApiDocument));
expressApp.use('/api/health', healthRouter);
expressApp.use('/api/auth', authRouter);
expressApp.use('/api/profile', profileRouter);
expressApp.use('/api/goals', goalsRouter);
expressApp.use('/api/recipes', recipesRouter);
expressApp.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route was not found.', details: null } }));
expressApp.use(errorHandler);