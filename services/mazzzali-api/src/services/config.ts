export interface AppConfig {
  environment: string;
  databaseUrl: string | undefined;
  postgresHost: string | undefined;
  postgresDatabase: string | undefined;
  postgresUser: string | undefined;
  blobEndpoint: string | undefined;
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
}

export function requireSetting(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function loadConfig(): AppConfig {
  const environment = process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'Production';
  const jwtSecret = requireSetting('JWT_SECRET');
  if (Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes.');
  }

  return {
    environment,
    databaseUrl: process.env.DATABASE_URL,
    postgresHost: process.env.AZURE_POSTGRES_HOST,
    postgresDatabase: process.env.AZURE_POSTGRES_DATABASE,
    postgresUser: process.env.AZURE_POSTGRES_USER,
    blobEndpoint: process.env.AZURE_STORAGE_BLOB_ENDPOINT,
    jwtSecret,
    jwtIssuer: process.env.JWT_ISSUER?.trim() || 'https://mazzzali.local',
    jwtAudience: process.env.JWT_AUDIENCE?.trim() || 'mazzzali-web',
  };
}