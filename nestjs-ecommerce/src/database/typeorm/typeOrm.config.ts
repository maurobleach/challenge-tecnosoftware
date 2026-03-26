import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from '../../common/helper/env.helper';
import { DataSourceOptions } from 'typeorm';

const envFilePath: string = getEnvPath(
  resolve(process.cwd(), 'src', 'common', 'envs'),
);
config({ path: envFilePath });
const isTsRuntime = __filename.endsWith('.ts');
const entitiesPath = isTsRuntime
  ? 'src/**/*.entity.ts'
  : 'dist/**/*.entity.js';
const migrationsPath = isTsRuntime
  ? 'src/database/migration/history/*.ts'
  : 'dist/database/migration/history/*.js';
const databaseUrl = process.env.DATABASE_URL;
const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;
// In managed platforms (Railway), DATABASE_URL must win over local fallback vars.
const databaseHost = parsedDatabaseUrl?.hostname || process.env.DATABASE_HOST;
const databasePort =
  parsedDatabaseUrl?.port || process.env.DATABASE_PORT || '5432';
const databaseName =
  parsedDatabaseUrl?.pathname.replace('/', '') || process.env.DATABASE_NAME;
const databaseUser = parsedDatabaseUrl?.username || process.env.DATABASE_USER;
const databasePassword =
  parsedDatabaseUrl?.password || process.env.DATABASE_PASSWORD;
if (!databaseHost || !databaseName || !databaseUser) {
  throw new Error(
    'Database configuration is incomplete. Set DATABASE_URL or DATABASE_HOST/DATABASE_NAME/DATABASE_USER.',
  );
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: databaseHost,
  port: parseInt(databasePort, 10),
  database: databaseName,
  username: databaseUser,
  password: databasePassword,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  logger: 'simple-console',
  synchronize: false, // never use TRUE in production!
  logging: true, // for debugging in dev Area only
};
