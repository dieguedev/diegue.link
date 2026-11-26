import { randomBytes } from 'crypto';
import {
  countUrlsByUser,
  createUrl,
  deleteUrl,
  findUrlByAddress,
  findUrlsByUser,
  updateUrl,
} from '@/domain/links/link-repository';

const CONFIG = {
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-zA-Z0-9-_]+$/,
  SLUG_LENGTH: 6,
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  MAX_ATTEMPTS: 3,
  PAGE_SIZE: 20,
};

const ERRORS = {
  URL_REQ: 'La URL es obligatoria.',
  URL_INV: 'La URL no es válida.',
  SLUG_GEN: 'No se ha podido generar un alias único.',
  SLUG_LONG: `El alias no puede tener más de ${CONFIG.SLUG_MAX_LENGTH} caracteres.`,
  SLUG_CHARS: 'El alias sólo puede contener letras, números y guiones.',
  SLUG_REQ: 'El alias es obligatorio.',
  SLUG_EXISTS: 'Este alias ya existe.',
  GENERIC: 'Error al crear la URL corta. Intenta de nuevo.',
  NOT_FOUND: 'Este enlace ya no existe.',
  UPDATE: 'No se han podido guardar los cambios. Intenta de nuevo.',
  DELETE: 'No se ha podido eliminar el enlace. Intenta de nuevo.',
};

function validateUrl(rawUrl: string): string | null {
  try {
    new URL(rawUrl);
  } catch {
    return ERRORS.URL_INV;
  }
  return null;
}

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

export function buildShortUrl(
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
  const urlError = validateUrl(rawUrl);
  if (urlError) return { status: 'error', error: urlError };

  if (rawSlug) {
    const validationError = validateSlug(rawSlug);
    if (validationError) return { status: 'error', error: validationError };

    const result = await createUrl({
      slug: rawSlug,
      fullUrl: rawUrl,
      userId,
      isAdmin,
    });
    if (result === 'collision')
      return { status: 'error', error: ERRORS.SLUG_EXISTS };
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

export type LinkSummary = {
  id: number;
  slug: string;
  fullUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
};

export type LinksPage = {
  links: LinkSummary[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listLinks(params: {
  userId: string;
  username: string;
  host: string;
  query?: string;
  page?: number;
}): Promise<LinksPage> {
  const { userId, username, host } = params;
  const query = params.query?.trim() || undefined;

  const total = await countUrlsByUser({ userId, query });
  const pageCount = Math.max(1, Math.ceil(total / CONFIG.PAGE_SIZE));
  // Una página fuera de rango (p. ej. al borrar el último Enlace de la última) cae en la más cercana
  const requested = Number.isInteger(params.page) ? params.page! : 1;
  const page = Math.min(Math.max(requested, 1), pageCount);

  const urls = await findUrlsByUser({
    userId,
    query,
    skip: (page - 1) * CONFIG.PAGE_SIZE,
    take: CONFIG.PAGE_SIZE,
  });

  return {
    links: urls.map(({ isAdmin, ...url }) => ({
      ...url,
      shortUrl: buildShortUrl(url.slug, isAdmin, username, host),
    })),
    total,
    page,
    pageCount,
  };
}

export type EditLinkParams = {
  id: number;
  userId: string;
  rawUrl: string | undefined;
  rawSlug: string | undefined;
};

export type MutationResult =
  | { status: 'success' }
  | { status: 'error'; error: string };

export async function editLink(
  params: EditLinkParams,
): Promise<MutationResult> {
  const { id, userId, rawUrl, rawSlug } = params;

  if (!rawUrl) return { status: 'error', error: ERRORS.URL_REQ };
  const urlError = validateUrl(rawUrl);
  if (urlError) return { status: 'error', error: urlError };

  if (!rawSlug) return { status: 'error', error: ERRORS.SLUG_REQ };
  const slugError = validateSlug(rawSlug);
  if (slugError) return { status: 'error', error: slugError };

  const result = await updateUrl({
    id,
    userId,
    slug: rawSlug,
    fullUrl: rawUrl,
  });
  if (result === 'collision')
    return { status: 'error', error: ERRORS.SLUG_EXISTS };
  if (result === 'not_found')
    return { status: 'error', error: ERRORS.NOT_FOUND };
  if (result === 'error') return { status: 'error', error: ERRORS.UPDATE };
  return { status: 'success' };
}

export async function removeLink(
  id: number,
  userId: string,
): Promise<MutationResult> {
  const result = await deleteUrl(id, userId);
  if (result === 'not_found')
    return { status: 'error', error: ERRORS.NOT_FOUND };
  if (result === 'error') return { status: 'error', error: ERRORS.DELETE };
  return { status: 'success' };
}

/**
 * Busca el Enlace al que apunta una Dirección. Sin `username` es una
 * Dirección del admin (`host/slug`); con él, la de un Usuario (`host/u/username/slug`).
 */
export async function resolveLink(params: {
  slug: string;
  username?: string;
}): Promise<{ id: number; fullUrl: string } | null> {
  return findUrlByAddress(params);
}
