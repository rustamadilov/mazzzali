export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseExecutor {
  query<T>(sql: string, values?: readonly unknown[]): Promise<QueryResult<T>>;
}

export interface IDatabaseService extends DatabaseExecutor {
  transaction<T>(work: (transaction: DatabaseExecutor) => Promise<T>): Promise<T>;
  healthCheck(): Promise<boolean>;
}