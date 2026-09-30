export type EatingFocus = 'weight-loss' | 'healthy-tasty-eating';
export type WeightUnit = 'kg' | 'lb';

export const recipeCategories = [
  'Quick & Easy',
  'High Protein',
  'Vegetarian',
  'Vegan',
  'Mediterranean',
  'Gluten-Free',
  'Budget-Friendly',
  'Desserts',
] as const;

export type RecipeCategory = (typeof recipeCategories)[number];

export interface User {
  id: string;
  email: string;
  displayName: string;
  focus: EatingFocus | null;
  categories: RecipeCategory[];
}

export interface Goal {
  startingWeight: number;
  targetWeight: number;
  weightUnit: WeightUnit;
  targetDate: string | null;
  updatedAt: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  description: string;
  categories: RecipeCategory[];
  prepMinutes: number;
  servings: number;
  imageUrl: string;
}

export interface Recipe extends RecipeSummary {
  ingredients: string[];
  steps: string[];
  sourceName: string;
  sourceUrl: string;
  videoEmbedUrl: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, 'available' | 'unavailable'>;
}