import {
  countClicksBy,
  countClicksByLink,
  countClicksPerDay,
  type ClickDimension,
  type ClickScope,
} from '@/domain/repositories/click-repository';
import {
  findUrlByIdForUser,
  findUrlsByIds,
} from '@/domain/repositories/url-repository';
import { buildShortUrl } from '@/domain/services/url-service';

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
  shortUrl: string;
  clicks: number;
};

export type ClicksOverview = ClicksTrend & { topLinks: TopLink[] };

export type LinkStats = ClicksTrend & {
  link: {
    id: number;
    slug: string;
    fullUrl: string;
    shortUrl: string;
    clicks: number;
    createdAt: Date;
  };
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
  username: string;
  host: string;
  days?: number;
}): Promise<ClicksOverview> {
  const { userId, username, host, days = STATS_RANGE_DAYS } = params;

  const [trend, byLink] = await Promise.all([
    getTrend({ userId }, days),
    countClicksByLink(userId, sinceDaysAgo(days)),
  ]);

  const top = byLink.slice(0, TOP_LIMIT);
  const urls = await findUrlsByIds(
    top.map(t => t.urlId),
    userId,
  );
  const urlsById = new Map(urls.map(url => [url.id, url]));

  const topLinks = top.flatMap(({ urlId, clicks }) => {
    const url = urlsById.get(urlId);
    if (!url) return [];
    return [
      {
        id: url.id,
        slug: url.slug,
        shortUrl: buildShortUrl(url.slug, url.isAdmin, username, host),
        clicks,
      },
    ];
  });

  return { ...trend, topLinks };
}

export async function getLinkStats(params: {
  id: number;
  userId: string;
  username: string;
  host: string;
  days?: number;
}): Promise<LinkStats | null> {
  const { id, userId, username, host, days = STATS_RANGE_DAYS } = params;

  // Comprueba que el Enlace es del Usuario antes de leer ningún Clic
  const url = await findUrlByIdForUser(id, userId);
  if (!url) return null;

  const scope = { urlId: url.id };
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

  const { isAdmin, ...link } = url;

  return {
    ...trend,
    link: { ...link, shortUrl: buildShortUrl(url.slug, isAdmin, username, host) },
    devices,
    countries: topWithOthers(countries),
    cities: topWithOthers(cities),
    referrers: topWithOthers(referrers),
    browsers: topWithOthers(browsers),
    os: topWithOthers(os),
  };
}
