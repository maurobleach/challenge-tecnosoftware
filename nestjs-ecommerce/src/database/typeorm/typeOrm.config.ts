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
const databaseHost = process.env.DATABASE_HOST || parsedDatabaseUrl?.hostname;
const databasePort =
  process.env.DATABASE_PORT || parsedDatabaseUrl?.port || '5432';
const databaseName =
  process.env.DATABASE_NAME || parsedDatabaseUrl?.pathname.replace('/', '');
const databaseUser = process.env.DATABASE_USER || parsedDatabaseUrl?.username;
const databasePassword =
  process.env.DATABASE_PASSWORD || parsedDatabaseUrl?.password;

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
