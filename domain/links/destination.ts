import { z } from 'zod';

const ERRORS = {
  REQUIRED: 'La URL es obligatoria.',
  INVALID: 'La URL no es válida.',
};

const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const HAS_PROTOCOL = /^[a-z][a-z\d+.-]*:\/\//i;

function toHttpUrl(value: string): URL | null {
  const withProtocol = HAS_PROTOCOL.test(value) ? value : `https://${value}`;
  if (!URL.canParse(withProtocol)) return null;
  const url = new URL(withProtocol);
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return null;
  if (!url.hostname.includes('.')) return null;
  return url;
}

export const destinationSchema = z
  .string({ error: ERRORS.REQUIRED })
  .trim()
  .min(1, ERRORS.REQUIRED)
  .transform((value, ctx) => {
    const url = toHttpUrl(value);
    if (url) return url.href;
    ctx.addIssue({ code: 'custom', message: ERRORS.INVALID });
    return z.NEVER;
  });

export type DestinationResult =
  | { status: 'valid'; destination: string }
  | { status: 'invalid'; error: string };

export function parseDestination(raw: unknown): DestinationResult {
  const result = destinationSchema.safeParse(raw);
  if (result.success) return { status: 'valid', destination: result.data };
  return { status: 'invalid', error: result.error.issues[0].message };
}
