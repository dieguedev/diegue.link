import { execSync } from 'node:child_process';
import { Client } from 'pg';
import { testEnv } from './env';

export default async function setup() {
  const url = new URL(testEnv.DIRECT_URL);
  const database = url.pathname.slice(1);
  url.pathname = '/postgres';

  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  try {
    await client.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
    await client.query(`CREATE DATABASE "${database}"`);
  } finally {
    await client.end();
  }

  execSync('yarn prisma migrate deploy', {
    env: { ...process.env, ...testEnv },
    stdio: 'inherit',
  });
}
