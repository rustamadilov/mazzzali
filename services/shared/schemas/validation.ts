import { z } from 'zod';
import { recipeCategories } from '../types/entities.js';

export const EatingFocusSchema = z.enum(['weight-loss', 'healthy-tasty-eating']);
export const RecipeCategorySchema = z.enum(recipeCategories);
export const WeightUnitSchema = z.enum(['kg', 'lb']);

export const RegisterSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(80),
  focus: EatingFocusSchema,
});

export const LoginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const ProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  focus: EatingFocusSchema.optional(),
  categories: z.array(RecipeCategorySchema).max(recipeCategories.length).optional(),
}).refine((input) => Object.values(input).some((value) => value !== undefined), {
  message: 'At least one profile field must be provided.',
});

export const GoalUpdateSchema = z.object({
  startingWeight: z.number().positive().max(1000),
  targetWeight: z.number().positive().max(1000),
  weightUnit: WeightUnitSchema,
});

export const RecipeQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: RecipeCategorySchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const RecipeIdSchema = z.object({ recipeId: z.string().trim().min(1).max(120) });

export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type GoalUpdate = z.infer<typeof GoalUpdateSchema>;
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>;
export type RecipeIdParams = z.infer<typeof RecipeIdSchema>;