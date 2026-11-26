import { randomBytes } from 'crypto';
import {
  countUrlsByUser,
  createUrl,
  deleteUrl,
  existsUnprefixedUrl,
  findUnprefixedUrl,
  findUrlByAddress,
  findUrlByIdForUser,
  findUrlsByIds,
  findUrlsByUser,
  findUsername,
  updateUrl,
} from '@/domain/links/link-repository';
import { parseDestination } from '@/domain/links/destination';
import {
  findDomainByHost,
  findVerifiedDomainOwnedBy,
} from '@/domain/domains/domain-repository';
import { PRIMARY_DOMAIN_HOST, domainHostOf, publicHostOf } from '@/lib/site';

const CONFIG = {
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-zA-Z0-9-_]+$/,
  SLUG_LENGTH: 6,
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  MAX_ATTEMPTS: 3,
  PAGE_SIZE: 20,
};

const ERRORS = {
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

type AddressableLink = {
  slug: string;
  isAdmin: boolean;
  domain: { host: string };
  user: { username: string };
};

function userPrefix(username: string): string {
  return `u/${username}/`;
}

function prefixOf({ isAdmin, user }: AddressableLink): string {
  return isAdmin ? '' : userPrefix(user.username);
}

function aliasOf(link: AddressableLink): string {
  const prefix = prefixOf(link);
  return link.slug.startsWith(prefix)
    ? link.slug.slice(prefix.length)
    : link.slug;
}

function toAddress(link: AddressableLink): string {
  const path = prefixOf(link) + aliasOf(link);
  return `${publicHostOf(link.domain.host)}/${path}`;
}

function toSummary(
  link: AddressableLink & Omit<LinkSummary, 'address'>,
): LinkSummary {
  const { isAdmin, domain, user, ...summary } = link;
  return { ...summary, slug: aliasOf(link), address: toAddress(link) };
}

type LinkTarget = { domainId: number; isAdmin: boolean; prefix: string };

async function targetFor(userId: string): Promise<LinkTarget | null> {
  const ownDomain = await findVerifiedDomainOwnedBy(userId);
  if (ownDomain) return { domainId: ownDomain.id, isAdmin: true, prefix: '' };

  const primaryDomain = await findDomainByHost(PRIMARY_DOMAIN_HOST);
  if (!primaryDomain) return null;

  const username = await findUsername(userId);
  return {
    domainId: primaryDomain.id,
    isAdmin: false,
    prefix: userPrefix(username),
  };
}

async function isTakenUnprefixed(
  { userId, isAdmin }: { userId: string; isAdmin: boolean },
  slug: string,
  exceptId?: number,
): Promise<boolean> {
  return !isAdmin && existsUnprefixedUrl({ userId, slug, exceptId });
}

export type LinkSummary = {
  id: number;
  slug: string;
  fullUrl: string;
  address: string;
  clicks: number;
  createdAt: Date;
};

export type ShortenParams = {
  rawUrl: string | undefined;
  rawSlug: string | undefined;
  userId: string;
};

export type ShortenResult =
  | { status: 'success'; link: LinkSummary }
  | { status: 'error'; error: string };

export async function shorten(params: ShortenParams): Promise<ShortenResult> {
  const { rawUrl, rawSlug, userId } = params;

  const parsed = parseDestination(rawUrl);
  if (parsed.status === 'invalid')
    return { status: 'error', error: parsed.error };
  const fullUrl = parsed.destination;

  if (rawSlug) {
    const validationError = validateSlug(rawSlug);
    if (validationError) return { status: 'error', error: validationError };
  }

  const target = await targetFor(userId);
  if (!target) return { status: 'error', error: ERRORS.GENERIC };
  const { domainId, isAdmin, prefix } = target;

  if (rawSlug) {
    if (await isTakenUnprefixed({ userId, isAdmin }, rawSlug))
      return { status: 'error', error: ERRORS.SLUG_EXISTS };

    const result = await createUrl({
      slug: prefix + rawSlug,
      fullUrl,
      userId,
      isAdmin,
      domainId,
    });
    if (result === 'collision')
      return { status: 'error', error: ERRORS.SLUG_EXISTS };
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };

    return { status: 'success', link: toSummary(result) };
  }

  for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug();
    if (await isTakenUnprefixed({ userId, isAdmin }, slug)) continue;

    const result = await createUrl({
      slug: prefix + slug,
      fullUrl,
      userId,
      isAdmin,
      domainId,
    });
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };
    if (result !== 'collision')
      return { status: 'success', link: toSummary(result) };
  }

  return { status: 'error', error: ERRORS.SLUG_GEN };
}

export type LinksPage = {
  links: LinkSummary[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listLinks(params: {
  userId: string;
  query?: string;
  page?: number;
}): Promise<LinksPage> {
  const { userId } = params;
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
    links: urls.map(toSummary),
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

  const parsed = parseDestination(rawUrl);
  if (parsed.status === 'invalid')
    return { status: 'error', error: parsed.error };
  const fullUrl = parsed.destination;

  if (!rawSlug) return { status: 'error', error: ERRORS.SLUG_REQ };
  const slugError = validateSlug(rawSlug);
  if (slugError) return { status: 'error', error: slugError };

  const link = await findUrlByIdForUser(id, userId);
  if (!link) return { status: 'error', error: ERRORS.NOT_FOUND };

  if (await isTakenUnprefixed({ userId, isAdmin: link.isAdmin }, rawSlug, id))
    return { status: 'error', error: ERRORS.SLUG_EXISTS };

  const result = await updateUrl({
    id,
    userId,
    slug: prefixOf(link) + rawSlug,
    fullUrl,
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

const USER_PATH = /^u\/([^/]+)\/([^/]+)$/;

export async function resolveLink({
  host,
  slug,
}: {
  host: string;
  slug: string;
}): Promise<{ id: number; fullUrl: string } | null> {
  const domainHost = domainHostOf(host);
  const link = await findUrlByAddress({ host: domainHost, slug });
  if (link) return link;

  const userPath = USER_PATH.exec(slug);
  if (!userPath) return null;

  const [, username, alias] = userPath;
  return findUnprefixedUrl({ host: domainHost, username, slug: alias });
}

export async function findLinkForUser(
  id: number,
  userId: string,
): Promise<LinkSummary | null> {
  const url = await findUrlByIdForUser(id, userId);
  return url && toSummary(url);
}

export async function findLinksByIds(
  ids: number[],
  userId: string,
): Promise<LinkSummary[]> {
  const urls = await findUrlsByIds(ids, userId);
  return urls.map(toSummary);
}
