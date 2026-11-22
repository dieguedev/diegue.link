import Link from 'next/link';
import { headers } from 'next/headers';
import { ChevronRight } from 'lucide-react';
import {
  getClicksOverview,
  STATS_RANGE_DAYS,
} from '@/domain/services/stats-service';
import { numberFormat } from '@/lib/utils/number-format';
import { ClicksAreaChart } from '@/features/clicks/components/clicks-area-chart';
import { StatsCard } from '@/features/clicks/components/stats-card';
import { TrendBadge } from '@/features/clicks/components/trend-badge';

interface ClicksOverviewProps {
  userId: string;
  username: string;
}

export async function ClicksOverview({ userId, username }: ClicksOverviewProps) {
  const host = (await headers()).get('host') || 'diegue.link';
  const { series, total, previousTotal, topLinks } = await getClicksOverview({
    userId,
    username,
    host,
  });

  // Sin Clics en ningún periodo el bloque no aporta nada
  if (total === 0 && previousTotal === 0) return null;

  return (
    <section
      aria-labelledby="overview-heading"
      className="grid gap-6 lg:grid-cols-3"
    >
      <h2 id="overview-heading" className="sr-only">
        Resumen de Clics
      </h2>

      <StatsCard
        title={`Clics en los últimos ${STATS_RANGE_DAYS} días`}
        className="lg:col-span-2"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-heading text-4xl tabular-nums">
            {numberFormat(total)}
          </span>
          <TrendBadge current={total} previous={previousTotal} />
        </div>
        <ClicksAreaChart data={series} />
      </StatsCard>

      <StatsCard
        title="Más visitados"
        description={`Últimos ${STATS_RANGE_DAYS} días`}
        isEmpty={topLinks.length === 0}
      >
        <ol className="flex flex-col gap-2">
          {topLinks.map((link, index) => (
            <li key={link.id}>
              <Link
                href={`/dashboard/links/${link.id}`}
                className="group flex items-center gap-3 rounded-base border-2 border-border bg-background px-3 py-2 transition-[translate,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-shadow focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <span className="font-heading text-foreground/50 tabular-nums">
                  {index + 1}
                </span>
                <span
                  className="min-w-0 flex-1 truncate font-heading"
                  title={link.shortUrl}
                >
                  {link.slug}
                </span>
                <span className="tabular-nums">
                  {numberFormat(link.clicks)}
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ol>
      </StatsCard>
    </section>
  );
}
