import { z } from 'zod';

export type AliasError =
  | 'ALIAS_REQUIRED'
  | 'ALIAS_TOO_LONG'
  | 'ALIAS_INVALID_CHARS';

const ERRORS = {
  REQUIRED: 'ALIAS_REQUIRED',
  TOO_LONG: 'ALIAS_TOO_LONG',
  INVALID_CHARS: 'ALIAS_INVALID_CHARS',
} satisfies Record<string, AliasError>;

export const ALIAS_MAX_LENGTH = 50;

export const aliasSchema = z
  .string({ error: ERRORS.REQUIRED })
  .trim()
  .min(1, ERRORS.REQUIRED)
  .max(ALIAS_MAX_LENGTH, ERRORS.TOO_LONG)
  .regex(/^[a-zA-Z0-9_-]+$/, ERRORS.INVALID_CHARS);

export type AliasResult =
  | { status: 'valid'; alias: string }
  | { status: 'invalid'; error: AliasError };

export function parseAlias(raw: unknown): AliasResult {
  const result = aliasSchema.safeParse(raw);
  if (result.success) return { status: 'valid', alias: result.data };
  return {
    status: 'invalid',
    error: result.error.issues[0].message as AliasError,
  };
}
