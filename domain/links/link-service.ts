import { randomBytes } from 'crypto';
import {
  countUrlsByUser,
  createUrl,
  deleteUrl,
  findUrlByAddress,
  findUrlByIdForUser,
  findUrlsByIds,
  findUrlsByUser,
  updateUrl,
} from '@/domain/links/link-repository';
import {
  parseDestination,
  type DestinationError,
} from '@/domain/links/destination';
import { parseAlias, type AliasError } from '@/domain/links/alias';
import {
  findDomainByHost,
  findDomainById,
  findVerifiedDomainsOwnedBy,
} from '@/domain/domains/domain-repository';
import { SYSTEM_DOMAIN_HOST, publicHostOf } from '@/lib/site';

const CONFIG = {
  GENERATED_ALIAS_LENGTHS: [5, 5, 5, 6],
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  PAGE_SIZE: 20,
};

export type LinkError =
  | DestinationError
  | AliasError
  | 'ALIAS_GENERATION_FAILED'
  | 'ALIAS_TAKEN'
  | 'DOMAIN_NOT_ALLOWED'
  | 'ALIAS_NOT_EDITABLE'
  | 'CREATE_FAILED'
  | 'LINK_NOT_FOUND'
  | 'UPDATE_FAILED'
  | 'DELETE_FAILED';

const ERRORS = {
  SLUG_GEN: 'ALIAS_GENERATION_FAILED',
  SLUG_EXISTS: 'ALIAS_TAKEN',
  DOMAIN_NOT_ALLOWED: 'DOMAIN_NOT_ALLOWED',
  ALIAS_NOT_EDITABLE: 'ALIAS_NOT_EDITABLE',
  GENERIC: 'CREATE_FAILED',
  NOT_FOUND: 'LINK_NOT_FOUND',
  UPDATE: 'UPDATE_FAILED',
  DELETE: 'DELETE_FAILED',
} satisfies Record<string, LinkError>;

function generateSlug(length: number): string {
  return Array.from(randomBytes(length))
    .map(byte => CONFIG.ALPHABET[byte % CONFIG.ALPHABET.length])
    .join('');
}

type OwnableDomain = { ownerId: string | null; verifiedAt: Date | null };

function isOwnDomain(domain: OwnableDomain, userId: string): boolean {
  return domain.ownerId === userId && domain.verifiedAt !== null;
}

type AddressableLink = {
  slug: string;
  userId: string;
  domain: OwnableDomain & { host: string };
};

function toAddress(link: AddressableLink): string {
  return `${publicHostOf(link.domain.host)}/${link.slug}`;
}

function isAliasEditable(link: AddressableLink): boolean {
  return isOwnDomain(link.domain, link.userId);
}

function toSummary(
  link: AddressableLink & Omit<LinkSummary, 'address' | 'aliasEditable'>,
): LinkSummary {
  const { userId, domain, ...summary } = link;
  return {
    ...summary,
    address: toAddress(link),
    aliasEditable: isAliasEditable(link),
  };
}

export type LinkDomain = { id: number; host: string; choosesAlias: boolean };

export async function linkDomainsFor(userId: string): Promise<LinkDomain[]> {
  const systemDomain = await findDomainByHost(SYSTEM_DOMAIN_HOST);
  const ownDomains = await findVerifiedDomainsOwnedBy(userId);
  return [
    ...(systemDomain
      ? [
          {
            id: systemDomain.id,
            host: publicHostOf(systemDomain.host),
            choosesAlias: false,
          },
        ]
      : []),
    ...ownDomains.map(({ id, host }) => ({ id, host, choosesAlias: true })),
  ];
}

type LinkTarget = { domainId: number; choosesAlias: boolean };

async function systemTarget(): Promise<LinkTarget | null> {
  const systemDomain = await findDomainByHost(SYSTEM_DOMAIN_HOST);
  return systemDomain && { domainId: systemDomain.id, choosesAlias: false };
}

async function chosenTargetFor(
  domainId: number,
  userId: string,
): Promise<LinkTarget | null> {
  if (!Number.isInteger(domainId)) return null;
  const domain = await findDomainById(domainId);
  if (!domain) return null;
  if (isOwnDomain(domain, userId)) return { domainId, choosesAlias: true };
  if (domain.host === SYSTEM_DOMAIN_HOST)
    return { domainId, choosesAlias: false };
  return null;
}

export type LinkSummary = {
  id: number;
  slug: string;
  fullUrl: string;
  address: string;
  aliasEditable: boolean;
  clicks: number;
  createdAt: Date;
};

export type ShortenParams = {
  rawUrl: string | undefined;
  rawSlug: string | undefined;
  domainId?: number;
  userId: string;
};

export type ShortenResult =
  | { status: 'success'; link: LinkSummary }
  | { status: 'error'; error: LinkError };

type NewLink = { fullUrl: string; userId: string; domainId: number };

async function createWithAlias(
  link: NewLink,
  slug: string,
): Promise<ShortenResult> {
  const result = await createUrl({ ...link, slug });
  if (result === 'collision')
    return { status: 'error', error: ERRORS.SLUG_EXISTS };
  if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };
  return { status: 'success', link: toSummary(result) };
}

async function createWithGeneratedAlias(link: NewLink): Promise<ShortenResult> {
  for (const length of CONFIG.GENERATED_ALIAS_LENGTHS) {
    const result = await createUrl({ ...link, slug: generateSlug(length) });
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };
    if (result !== 'collision')
      return { status: 'success', link: toSummary(result) };
  }
  return { status: 'error', error: ERRORS.SLUG_GEN };
}

async function createInTarget({
  fullUrl,
  userId,
  rawSlug,
  target,
}: {
  fullUrl: string;
  userId: string;
  rawSlug: string | undefined;
  target: LinkTarget;
}): Promise<ShortenResult> {
  const link = { fullUrl, userId, domainId: target.domainId };
  if (!target.choosesAlias || !rawSlug) return createWithGeneratedAlias(link);

  const parsedAlias = parseAlias(rawSlug);
  if (parsedAlias.status === 'invalid')
    return { status: 'error', error: parsedAlias.error };
  return createWithAlias(link, parsedAlias.alias);
}

export async function shorten(params: ShortenParams): Promise<ShortenResult> {
  const { rawUrl, rawSlug, domainId, userId } = params;

  const parsed = parseDestination(rawUrl);
  if (parsed.status === 'invalid')
    return { status: 'error', error: parsed.error };
  const fullUrl = parsed.destination;

  if (domainId === undefined) {
    const target = await systemTarget();
    if (!target) return { status: 'error', error: ERRORS.GENERIC };
    return createInTarget({ fullUrl, userId, rawSlug, target });
  }

  const target = await chosenTargetFor(domainId, userId);
  if (!target) return { status: 'error', error: ERRORS.DOMAIN_NOT_ALLOWED };
  return createInTarget({ fullUrl, userId, rawSlug, target });
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

type EditedSlug =
  | { status: 'ok'; slug: string }
  | { status: 'error'; error: LinkError };

function editedSlugOf(
  link: AddressableLink,
  rawSlug: string | undefined,
): EditedSlug {
  if (!isAliasEditable(link)) {
    if (rawSlug) return { status: 'error', error: ERRORS.ALIAS_NOT_EDITABLE };
    return { status: 'ok', slug: link.slug };
  }

  const parsedAlias = parseAlias(rawSlug);
  if (parsedAlias.status === 'invalid')
    return { status: 'error', error: parsedAlias.error };
  return { status: 'ok', slug: parsedAlias.alias };
}

export async function editLink(
  params: EditLinkParams,
): Promise<MutationResult> {
  const { id, userId, rawUrl, rawSlug } = params;

  const parsed = parseDestination(rawUrl);
  if (parsed.status === 'invalid')
    return { status: 'error', error: parsed.error };
  const fullUrl = parsed.destination;

  const link = await findUrlByIdForUser(id, userId);
  if (!link) return { status: 'error', error: ERRORS.NOT_FOUND };

  const slug = editedSlugOf(link, rawSlug);
  if (slug.status === 'error') return slug;

  const result = await updateUrl({ id, userId, slug: slug.slug, fullUrl });
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
