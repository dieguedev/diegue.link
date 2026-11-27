import { randomBytes } from 'crypto';
import {
  countUrlsByUser,
  createUrl,
  deleteUrl,
  findUrlByAddress,
  findUrlByIdForUser,
  findUrlsByIds,
  findUrlsByUser,
  findUsername,
  updateUrl,
} from '@/domain/links/link-repository';
import {
  parseDestination,
  type DestinationError,
} from '@/domain/links/destination';
import {
  findDomainByHost,
  findVerifiedDomainOwnedBy,
} from '@/domain/domains/domain-repository';
import { PRIMARY_DOMAIN_HOST, publicHostOf } from '@/lib/site';

const CONFIG = {
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-zA-Z0-9-_]+$/,
  SLUG_LENGTH: 6,
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  MAX_ATTEMPTS: 3,
  PAGE_SIZE: 20,
};

export type LinkError =
  | DestinationError
  | 'ALIAS_GENERATION_FAILED'
  | 'ALIAS_TOO_LONG'
  | 'ALIAS_INVALID_CHARS'
  | 'ALIAS_REQUIRED'
  | 'ALIAS_TAKEN'
  | 'CREATE_FAILED'
  | 'LINK_NOT_FOUND'
  | 'UPDATE_FAILED'
  | 'DELETE_FAILED';

const ERRORS = {
  SLUG_GEN: 'ALIAS_GENERATION_FAILED',
  SLUG_LONG: 'ALIAS_TOO_LONG',
  SLUG_CHARS: 'ALIAS_INVALID_CHARS',
  SLUG_REQ: 'ALIAS_REQUIRED',
  SLUG_EXISTS: 'ALIAS_TAKEN',
  GENERIC: 'CREATE_FAILED',
  NOT_FOUND: 'LINK_NOT_FOUND',
  UPDATE: 'UPDATE_FAILED',
  DELETE: 'DELETE_FAILED',
} satisfies Record<string, LinkError>;

function validateSlug(slug: string): LinkError | null {
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
  userId: string;
  domain: { host: string; ownerId: string | null };
  user: { username: string };
};

function userPrefix(username: string): string {
  return `u/${username}/`;
}

function prefixOf({ userId, domain, user }: AddressableLink): string {
  return domain.ownerId === userId ? '' : userPrefix(user.username);
}

function aliasOf(link: AddressableLink): string {
  return link.slug.slice(prefixOf(link).length);
}

function toAddress(link: AddressableLink): string {
  return `${publicHostOf(link.domain.host)}/${link.slug}`;
}

function toSummary(
  link: AddressableLink & Omit<LinkSummary, 'address'>,
): LinkSummary {
  const { userId, domain, user, ...summary } = link;
  return { ...summary, slug: aliasOf(link), address: toAddress(link) };
}

type LinkTarget = { domainId: number; prefix: string };

async function targetFor(userId: string): Promise<LinkTarget | null> {
  const ownDomain = await findVerifiedDomainOwnedBy(userId);
  if (ownDomain) return { domainId: ownDomain.id, prefix: '' };

  const primaryDomain = await findDomainByHost(PRIMARY_DOMAIN_HOST);
  if (!primaryDomain) return null;

  const username = await findUsername(userId);
  return { domainId: primaryDomain.id, prefix: userPrefix(username) };
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
  | { status: 'error'; error: LinkError };

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
  const { domainId, prefix } = target;

  if (rawSlug) {
    const result = await createUrl({
      slug: prefix + rawSlug,
      fullUrl,
      userId,
      domainId,
    });
    if (result === 'collision')
      return { status: 'error', error: ERRORS.SLUG_EXISTS };
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };

    return { status: 'success', link: toSummary(result) };
  }

  for (let attempt = 0; attempt < CONFIG.MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug();
    const result = await createUrl({
      slug: prefix + slug,
      fullUrl,
      userId,
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
  | { status: 'error'; error: LinkError };

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

export async function resolveLink({
  domain,
  slug,
}: {
  domain: string;
  slug: string;
}): Promise<{ id: number; fullUrl: string } | null> {
  return findUrlByAddress({ host: domain, slug });
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
