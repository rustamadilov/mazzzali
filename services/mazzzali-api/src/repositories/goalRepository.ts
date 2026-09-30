import type { Goal } from '../../../shared/types/entities.js';
import type { IDatabaseService } from '../services/interfaces/IDatabaseService.js';

export class GoalRepository {
  constructor(private readonly database: IDatabaseService) {}

  async findByUserId(userId: string): Promise<Goal | null> {
    const result = await this.database.query<Goal>(
      `SELECT starting_weight, target_weight, weight_unit, target_date::text AS target_date, updated_at
       FROM goals WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0] ?? null;
  }

  async upsert(userId: string, goal: Omit<Goal, 'updatedAt'>): Promise<Goal> {
    const result = await this.database.query<Goal>(
      `INSERT INTO goals (user_id, starting_weight, target_weight, weight_unit, target_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id) DO UPDATE SET starting_weight = EXCLUDED.starting_weight,
         target_weight = EXCLUDED.target_weight, weight_unit = EXCLUDED.weight_unit,
         target_date = EXCLUDED.target_date, updated_at = NOW()
      RETURNING starting_weight, target_weight, weight_unit, target_date::text AS target_date, updated_at`,
      [userId, goal.startingWeight, goal.targetWeight, goal.weightUnit, goal.targetDate],
    );
    return result.rows[0];
  }
}