import { randomUUID } from 'node:crypto';
import type { User, RecipeCategory } from '../../../shared/types/entities.js';
import type { DatabaseExecutor, IDatabaseService } from '../services/interfaces/IDatabaseService.js';
import { ConflictError } from '../errors/appError.js';

interface UserRow extends User { passwordHash?: string }

export class UserRepository {
  constructor(private readonly database: IDatabaseService) {}

  async create(input: { email: string; passwordHash: string; displayName: string; focus: User['focus'] }): Promise<User> {
    try {
      const result = await this.database.query<UserRow>(
        `INSERT INTO users (id, email, password_hash, display_name, focus, categories)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, display_name, focus, categories`,
        [randomUUID(), input.email, input.passwordHash, input.displayName, input.focus, []],
      );
      return result.rows[0];
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictError('An account with this email already exists.');
      throw error;
    }
  }

  async findByEmailWithPassword(email: string): Promise<{ user: User; passwordHash: string } | null> {
    const result = await this.database.query<UserRow>(
      `SELECT id, email, display_name, focus, categories, password_hash
       FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    const row = result.rows[0];
    return row?.passwordHash ? { user: withoutPassword(row), passwordHash: row.passwordHash } : null;
  }

  findById(id: string): Promise<User | null> {
    return this.findOne('SELECT id, email, display_name, focus, categories FROM users WHERE id = $1', [id]);
  }

  async update(id: string, input: { displayName?: string; focus?: User['focus']; categories?: RecipeCategory[] }): Promise<User | null> {
    return this.database.transaction(async (transaction) => {
      const current = await this.findOne('SELECT id, email, display_name, focus, categories FROM users WHERE id = $1 FOR UPDATE', [id], transaction);
      if (!current) return null;
      const updated = {
        displayName: input.displayName ?? current.displayName,
        focus: input.focus ?? current.focus,
        categories: input.categories ?? current.categories,
      };
      return this.findOne(
        `UPDATE users SET display_name = $2, focus = $3, categories = $4, updated_at = NOW()
         WHERE id = $1 RETURNING id, email, display_name, focus, categories`,
        [id, updated.displayName, updated.focus, updated.categories],
        transaction,
      );
    });
  }

  private async findOne(sql: string, values: readonly unknown[], executor: DatabaseExecutor = this.database): Promise<User | null> {
    const result = await executor.query<UserRow>(sql, values);
    const row = result.rows[0];
    return row ? withoutPassword(row) : null;
  }
}

function withoutPassword(row: UserRow): User {
  const { passwordHash: _passwordHash, ...user } = row;
  return { ...user, categories: user.categories ?? [] };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}