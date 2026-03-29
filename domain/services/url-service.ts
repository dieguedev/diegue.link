import { randomBytes } from 'crypto';
import { createUrl } from '@/domain/repositories/url-repository';

const CONFIG = {
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-zA-Z0-9-_]+$/,
  SLUG_LENGTH: 6,
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  MAX_ATTEMPTS: 3,
};

const ERRORS = {
  URL_REQ: 'La URL es obligatoria.',
  URL_INV: 'La URL no es válida.',
  SLUG_GEN: 'No se ha podido generar un alias único.',
  SLUG_LONG: `El alias no puede tener más de ${CONFIG.SLUG_MAX_LENGTH} caracteres.`,
  SLUG_CHARS: 'El alias sólo puede contener letras, números y guiones.',
  SLUG_EXISTS: 'Este alias ya existe.',
  GENERIC: 'Error al crear la URL corta. Intenta de nuevo.',
};

function validateSlug(slug: string): string | null {
  if (slug.length > CONFIG.SLUG_MAX_LENGTH) return ERRORS.SLUG_LONG;
  if (!CONFIG.SLUG_PATTERN.test(slug)) return ERRORS.SLUG_CHARS;
  return null;
}

function generateSlug(length = CONFIG.SLUG_LENGTH): string {
  return Array.from(randomBytes(length))
    .map(byte => CONFIG.ALPHABET[byte % CONFIG.ALPHABET.length])
    .join('');
}

function buildShortUrl(
  slug: string,
  isAdmin: boolean,
  username: string,
  host: string,
): string {
  return isAdmin ? `${host}/${slug}` : `${host}/u/${username}/${slug}`;
}

export type ShortenParams = {
  rawUrl: string | undefined;
  rawSlug: string | undefined;
  userId: string;
  isAdmin: boolean;
  username: string;
  host: string;
};

export type ShortenResult =
  | { status: 'success'; shortUrl: string }
  | { status: 'error'; error: string };

export async function shorten(params: ShortenParams): Promise<ShortenResult> {
  const { rawUrl, rawSlug, userId, isAdmin, username, host } = params;

  if (!rawUrl) return { status: 'error', error: ERRORS.URL_REQ };
  try {
    new URL(rawUrl);
  } catch {
    return { status: 'error', error: ERRORS.URL_INV };
  }

  if (rawSlug) {
    const validationError = validateSlug(rawSlug);
    if (validationError) return { status: 'error', error: validationError };

    const result = await createUrl({ slug: rawSlug, fullUrl: rawUrl, userId, isAdmin });
    if (result === 'collision') return { status: 'error', error: ERRORS.SLUG_EXISTS };
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };

    return {
      status: 'success',
      shortUrl: buildShortUrl(rawSlug, isAdmin, username, host),
    };
  }

  for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug();
    const result = await createUrl({ slug, fullUrl: rawUrl, userId, isAdmin });
    if (result === 'success') {
      return {
        status: 'success',
        shortUrl: buildShortUrl(slug, isAdmin, username, host),
      };
    }
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };
  }

  return { status: 'error', error: ERRORS.SLUG_GEN };
}
