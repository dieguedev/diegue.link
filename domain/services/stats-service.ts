import {
  countClicksBy,
  countClicksByLink,
  countClicksPerDay,
  type ClickDimension,
  type ClickScope,
} from '@/domain/repositories/click-repository';
import {
  findLinkForUser,
  findLinksByIds,
  type LinkSummary,
} from '@/domain/links/link-service';

export const STATS_RANGE_DAYS = 30;
const TOP_LIMIT = 5;
const BREAKDOWN_LIMIT = 6;

export type DailyClicks = { date: string; clicks: number };

export type ClicksTrend = {
  series: DailyClicks[];
  total: number;
  previousTotal: number;
};

export type BreakdownItem = { value: string | null; clicks: number };

export type TopLink = {
  id: number;
  slug: string;
  address: string;
  clicks: number;
};

export type ClicksOverview = ClicksTrend & { topLinks: TopLink[] };

export type LinkStats = ClicksTrend & {
  link: LinkSummary;
  devices: BreakdownItem[];
  countries: BreakdownItem[];
  cities: BreakdownItem[];
  referrers: BreakdownItem[];
  browsers: BreakdownItem[];
  os: BreakdownItem[];
};

function sinceDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Pide el doble de días para comparar el periodo actual con el anterior */
async function getTrend(scope: ClickScope, days: number): Promise<ClicksTrend> {
  const rows = await countClicksPerDay(scope, days * 2);
  const previous = rows.slice(0, days);
  const series = rows.slice(days).map(r => ({ date: r.day, clicks: r.clicks }));
  const sum = (items: { clicks: number }[]) =>
    items.reduce((acc, item) => acc + item.clicks, 0);

  return { series, total: sum(series), previousTotal: sum(previous) };
}

/** Deja los N primeros y agrupa el resto, para que las gráficas no se desborden */
function topWithOthers(
  items: BreakdownItem[],
  limit = BREAKDOWN_LIMIT,
): BreakdownItem[] {
  if (items.length <= limit) return items;
  const head = items.slice(0, limit - 1);
  const rest = items.slice(limit - 1).reduce((acc, i) => acc + i.clicks, 0);
  return [...head, { value: 'other', clicks: rest }];
}

export async function getClicksOverview(params: {
  userId: string;
  days?: number;
}): Promise<ClicksOverview> {
  const { userId, days = STATS_RANGE_DAYS } = params;

  const [trend, byLink] = await Promise.all([
    getTrend({ userId }, days),
    countClicksByLink(userId, sinceDaysAgo(days)),
  ]);

  const top = byLink.slice(0, TOP_LIMIT);
  const links = await findLinksByIds(
    top.map(t => t.urlId),
    userId,
  );
  const linksById = new Map(links.map(link => [link.id, link]));

  const topLinks = top.flatMap(({ urlId, clicks }) => {
    const link = linksById.get(urlId);
    if (!link) return [];
    return [{ id: link.id, slug: link.slug, address: link.address, clicks }];
  });

  return { ...trend, topLinks };
}

export async function getLinkStats(params: {
  id: number;
  userId: string;
  days?: number;
}): Promise<LinkStats | null> {
  const { id, userId, days = STATS_RANGE_DAYS } = params;

  // Comprueba que el Enlace es del Usuario antes de leer ningún Clic
  const link = await findLinkForUser(id, userId);
  if (!link) return null;

  const scope = { urlId: link.id };
  const since = sinceDaysAgo(days);
  const breakdown = (dimension: ClickDimension) =>
    countClicksBy(scope, dimension, since);

  const [trend, devices, countries, cities, referrers, browsers, os] =
    await Promise.all([
      getTrend(scope, days),
      breakdown('device'),
      breakdown('country'),
      breakdown('city'),
      breakdown('referrer'),
      breakdown('browser'),
      breakdown('os'),
    ]);

  return {
    ...trend,
    link,
    devices,
    countries: topWithOthers(countries),
    cities: topWithOthers(cities),
    referrers: topWithOthers(referrers),
    browsers: topWithOthers(browsers),
    os: topWithOthers(os),
  };
}
