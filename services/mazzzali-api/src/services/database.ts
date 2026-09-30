import { DefaultAzureCredential } from '@azure/identity';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import type { AppConfig } from './config.js';
import type { DatabaseExecutor, IDatabaseService, QueryResult } from './interfaces/IDatabaseService.js';
import { requireSetting } from './config.js';

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function mapRow<T>(row: QueryResultRow): T {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [toCamelCase(key), value])) as T;
}

export class PostgresDatabaseService implements IDatabaseService {
  private readonly pool: Pool;

  constructor(config: AppConfig) {
    if (config.environment === 'Development') {
      this.pool = new Pool({ connectionString: config.databaseUrl ?? requireSetting('DATABASE_URL') });
      return;
    }

    const host = config.postgresHost ?? requireSetting('AZURE_POSTGRES_HOST');
    const database = config.postgresDatabase ?? requireSetting('AZURE_POSTGRES_DATABASE');
    const user = config.postgresUser ?? requireSetting('AZURE_POSTGRES_USER');
    const credential = new DefaultAzureCredential();
    this.pool = new Pool({
      host,
      database,
      user,
      port: 5432,
      ssl: { rejectUnauthorized: true },
      password: async () => {
        const token = await credential.getToken('https://ossrdbms-aad.database.windows.net/.default');
        if (!token) throw new Error('Managed identity could not obtain a PostgreSQL access token.');
        return token.token;
      },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  async query<T>(sql: string, values: readonly unknown[] = []): Promise<QueryResult<T>> {
    const result = await this.pool.query<QueryResultRow>(sql, [...values]);
    return { rows: result.rows.map((row) => mapRow<T>(row)), rowCount: result.rowCount ?? 0 };
  }

  async transaction<T>(work: (transaction: DatabaseExecutor) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    const transaction = this.createExecutor(client);
    try {
      await client.query('BEGIN');
      const result = await work(transaction);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private createExecutor(client: PoolClient): DatabaseExecutor {
    return {
      query: async <T>(sql: string, values: readonly unknown[] = []) => {
        const result = await client.query<QueryResultRow>(sql, [...values]);
        return { rows: result.rows.map((row) => mapRow<T>(row)), rowCount: result.rowCount ?? 0 };
      },
    };
  }
}