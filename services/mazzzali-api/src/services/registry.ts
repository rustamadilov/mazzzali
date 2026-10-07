import { AuthService } from './authService.js';
import { loadConfig } from './config.js';
import { BlobStorageService, createBlobClientProvider } from './blobStorage.js';
import { PostgresDatabaseService } from './database.js';
import type { IAuthService } from './interfaces/IAuthService.js';
import type { IBlobStorageService } from './interfaces/IBlobStorageService.js';
import type { IDatabaseService } from './interfaces/IDatabaseService.js';
import { GoalRepository } from '../repositories/goalRepository.js';
import { RecipeRepository } from '../repositories/recipeRepository.js';
import { UserRepository } from '../repositories/userRepository.js';

export interface Services {
  auth: IAuthService;
  database: IDatabaseService;
  blobStorage: IBlobStorageService;
  users: UserRepository;
  goals: GoalRepository;
  recipes: RecipeRepository;
}

let services: Services | null = null;

export function initializeServices(): Services {
  const config = loadConfig();
  const database = new PostgresDatabaseService(config);
  const blobStorage = new BlobStorageService(createBlobClientProvider(config));
  const users = new UserRepository(database);
  services = {
    auth: new AuthService(users, config.jwtSecret, config.jwtIssuer, config.jwtAudience),
    database,
    blobStorage,
    users,
    goals: new GoalRepository(database),
    recipes: new RecipeRepository(database),
  };
  return services;
}

export function getServices(): Services {
  return services ?? initializeServices();
}

export function registerServices(registry: Services): void {
  services = registry;
}

export function clearServices(): void {
  services = null;
}