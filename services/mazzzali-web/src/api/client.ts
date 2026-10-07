import {
  recipeCategories,
  type Goal,
  type GoalUpdate,
  type HealthStatus,
  type LoginRequest,
  type ProfileUpdate,
  type Recipe,
  type RecipeCategory,
  type RecipeQuery,
  type RecipeSummary,
  type RegisterRequest,
  type User,
} from '@mazzzali/shared';

const API_BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

export interface ApiClient {
  getHealth(): Promise<HealthStatus>;
  register(input: RegisterRequest): Promise<User>;
  login(input: LoginRequest): Promise<User>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
  updateProfile(input: ProfileUpdate): Promise<User>;
  getGoal(): Promise<Goal | null>;
  updateGoal(input: GoalUpdate): Promise<Goal>;
  listRecipes(query?: Omit<RecipeQuery, 'limit'> & { limit?: number }): Promise<{ recipes: RecipeSummary[]; total: number }>;
  getRecipe(recipeId: string): Promise<Recipe | null>;
  listRecipeCategories(): Promise<RecipeCategory[]>;
}

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, readErrorMessage(payload, response.statusText));
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'error' in payload) {
    const error = payload.error;
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
      if ('details' in error && Array.isArray(error.details)) {
        const details = error.details.filter(isFieldError);
        if (details.length > 0) {
          return `${error.message} ${details.map(({ field, message }) => `${field}: ${message}`).join(' ')}`;
        }
      }
      return error.message;
    }
  }
  return fallback || 'The request could not be completed.';
}

function isFieldError(value: unknown): value is { field: string; message: string } {
  return typeof value === 'object' && value !== null
    && 'field' in value && typeof value.field === 'string'
    && 'message' in value && typeof value.message === 'string';
}

function jsonBody(body: unknown): Pick<RequestInit, 'body' | 'method'> {
  return { method: 'POST', body: JSON.stringify(body) };
}

export const liveClient: ApiClient = {
  getHealth: () => request<HealthStatus>('/health'),
  register: async (input) => (await request<{ user: User }>('/auth/register', jsonBody(input))).user,
  login: async (input) => (await request<{ user: User }>('/auth/login', jsonBody(input))).user,
  getCurrentUser: async () => (await request<{ user: User }>('/profile/me')).user,
  logout: async () => { await request<void>('/auth/logout', { method: 'POST' }); },
  updateProfile: async (input) => (await request<{ user: User }>('/profile/me', { method: 'PUT', body: JSON.stringify(input) })).user,
  getGoal: async () => {
    try {
      return (await request<{ goal: Goal }>('/goals')).goal;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  updateGoal: async (input) => (await request<{ goal: Goal }>('/goals', { method: 'PUT', body: JSON.stringify(input) })).goal,
  listRecipes: async (query: Omit<RecipeQuery, 'limit'> & { limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.category) params.set('category', query.category);
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    const suffix = params.size ? `?${params.toString()}` : '';
    return request<{ recipes: RecipeSummary[]; total: number }>(`/recipes${suffix}`);
  },
  getRecipe: async (recipeId) => {
    try {
      return (await request<{ recipe: Recipe }>(`/recipes/${encodeURIComponent(recipeId)}`)).recipe;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  listRecipeCategories: async () => [...recipeCategories],
};