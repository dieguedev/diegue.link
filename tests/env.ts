import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

/** Variables de `.env.test`, que ganan a las de `.env` en los tests */
export const testEnv = parse(readFileSync('.env.test'));
