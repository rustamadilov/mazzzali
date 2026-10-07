import type { Goal, HealthStatus, Recipe, RecipeSummary, User } from './entities.js';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details: unknown;
  };
}

export interface UserResponse { user: User }
export interface ProfileResponse { user: User; focus: User['focus']; categories: User['categories'] }
export interface GoalResponse { goal: Goal }
export interface RecipeListResponse { recipes: RecipeSummary[]; total: number }
export interface RecipeResponse { recipe: Recipe }
export type HealthResponse = HealthStatus;