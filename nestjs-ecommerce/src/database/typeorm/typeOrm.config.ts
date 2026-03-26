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

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [entitiesPath],
  migrations: [migrationsPath],
  logger: 'simple-console',
  synchronize: false, // never use TRUE in production!
  logging: true, // for debugging in dev Area only
};
