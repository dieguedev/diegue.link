import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import type { ClickMetadata } from '@/lib/analytics/click-metadata';

const TIME_ZONE = 'Europe/Madrid';

/**
 * Guarda el Clic con su detalle. Los bots se guardan para poder auditarlos,
 * pero no suman al total del Enlace.
 */
export async function recordClick(urlId: number, metadata: ClickMetadata) {
  try {
    if (metadata.isBot) {
      await prisma.click.create({ data: { urlId, ...metadata } });
      return;
    }
    await prisma.$transaction([
      prisma.click.create({ data: { urlId, ...metadata } }),
      prisma.url.update({
        where: { id: urlId },
        data: { clicks: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    // Corre en `after()`: si falla, la redirección ya se ha servido
    console.error('Error recording click:', error);
  }
}

export type ClickScope = { userId: string } | { urlId: number };

function scopeSql(scope: ClickScope) {
  return 'urlId' in scope
    ? Prisma.sql`c."urlId" = ${scope.urlId}`
    : Prisma.sql`u."userId" = ${scope.userId}`;
}

function scopeWhere(scope: ClickScope) {
  return 'urlId' in scope
    ? { urlId: scope.urlId }
    : { url: { userId: scope.userId } };
}

/**
 * Clics de personas por día natural (hora de Madrid), de hoy hacia atrás.
 * Incluye los días sin Clics a 0.
 */
export async function countClicksPerDay(scope: ClickScope, days: number) {
  const rows = await prisma.$queryRaw<{ day: string; clicks: number }[]>`
    WITH days AS (
      SELECT generate_series(
        (now() AT TIME ZONE ${TIME_ZONE})::date - (${days}::int - 1),
        (now() AT TIME ZONE ${TIME_ZONE})::date,
        interval '1 day'
      )::date AS day
    ),
    counts AS (
      SELECT (c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${TIME_ZONE})::date AS day,
             COUNT(*)::int AS clicks
      FROM "Click" c
      JOIN "Url" u ON u.id = c."urlId"
      WHERE c."isBot" = false
        AND c."createdAt" >= now() AT TIME ZONE 'UTC' - (${days}::int + 1) * interval '1 day'
        AND ${scopeSql(scope)}
      GROUP BY 1
    )
    SELECT to_char(days.day, 'YYYY-MM-DD') AS day,
           COALESCE(counts.clicks, 0)::int AS clicks
    FROM days
    LEFT JOIN counts USING (day)
    ORDER BY days.day
  `;
  return rows;
}

export type ClickDimension =
  | 'country'
  | 'city'
  | 'device'
  | 'browser'
  | 'os'
  | 'referrer';

export async function countClicksBy(
  scope: ClickScope,
  dimension: ClickDimension,
  since: Date,
) {
  const rows = await prisma.click.groupBy({
    by: [dimension],
    where: { ...scopeWhere(scope), isBot: false, createdAt: { gte: since } },
    _count: { _all: true },
  });
  return rows
    .map(row => ({ value: row[dimension], clicks: row._count._all }))
    .sort((a, b) => b.clicks - a.clicks);
}

export async function countClicksByLink(userId: string, since: Date) {
  const rows = await prisma.click.groupBy({
    by: ['urlId'],
    where: { url: { userId }, isBot: false, createdAt: { gte: since } },
    _count: { _all: true },
  });
  return rows
    .map(row => ({ urlId: row.urlId, clicks: row._count._all }))
    .sort((a, b) => b.clicks - a.clicks);
}
