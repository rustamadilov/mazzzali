import type { Recipe, RecipeCategory, RecipeSummary } from '../../../shared/types/entities.js';
import type { RecipeQuery } from '../../../shared/schemas/validation.js';
import type { IDatabaseService } from '../services/interfaces/IDatabaseService.js';

export class RecipeRepository {
  constructor(private readonly database: IDatabaseService) {}

  async list(query: RecipeQuery): Promise<{ recipes: RecipeSummary[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    if (query.q) {
      values.push(`%${query.q}%`);
      conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }
    if (query.category) {
      values.push(query.category);
      conditions.push(`$${values.length} = ANY(categories)`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await this.database.query<{ total: string }>(`SELECT COUNT(*) AS total FROM recipes ${where}`, values);
    values.push(query.limit);
    const recipes = await this.database.query<RecipeSummary>(
      `SELECT id, name, description, categories, prep_minutes, servings, image_url, short_url
       FROM recipes ${where} ORDER BY name LIMIT $${values.length}`,
      values,
    );
    return { recipes: recipes.rows, total: Number(count.rows[0]?.total ?? 0) };
  }

  async findById(recipeId: string): Promise<Recipe | null> {
    const result = await this.database.query<Recipe>(
      `SELECT id, name, description, categories, prep_minutes, servings, image_url, short_url,
         ingredients, steps, source_name, source_url, video_embed_url
       FROM recipes WHERE id = $1`,
      [recipeId],
    );
    return result.rows[0] ?? null;
  }

  async listCategories(): Promise<RecipeCategory[]> {
    const result = await this.database.query<{ categories: RecipeCategory[] }>(
      'SELECT DISTINCT categories FROM recipes ORDER BY categories',
    );
    return [...new Set(result.rows.flatMap((row) => row.categories ?? []))];
  }
}