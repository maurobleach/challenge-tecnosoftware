import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string = process.env.NODE_ENV || 'development';
  const candidates: string[] = [
    resolve(process.cwd(), `.env.${env}`),
    resolve(process.cwd(), '.env'),
    resolve(`${dest}/${env}.env`),
    resolve(`${dest}/development.env`),
    resolve(`${dest}/.env`),
  ];

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      return filePath;
    }
  }

  return resolve(process.cwd(), '.env');
}
