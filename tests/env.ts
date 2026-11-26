import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

export const testEnv = parse(readFileSync('.env.test'));
