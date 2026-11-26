import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CornerDownRight } from 'lucide-react';
import {
  getLinkStats,
  STATS_RANGE_DAYS,
} from '@/domain/services/stats-service';
import { numberFormat } from '@/lib/utils/number-format';
import { toChartItems, toDeviceItems } from '@/features/clicks/labels';
import { ClicksAreaChart } from '@/features/clicks/components/clicks-area-chart';
import { ClicksBarChart } from '@/features/clicks/components/clicks-bar-chart';
import { DevicesDonutChart } from '@/features/clicks/components/devices-donut-chart';
import { StatsCard } from '@/features/clicks/components/stats-card';
import { TrendBadge } from '@/features/clicks/components/trend-badge';

const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' });
const RANGE = `Últimos ${STATS_RANGE_DAYS} días`;

interface LinkStatsProps {
  id: number;
  userId: string;
}

export async function LinkStats({ id, userId }: LinkStatsProps) {
  const stats = await getLinkStats({ id, userId });
  if (!stats) notFound();

  const { link, series, total, previousTotal } = stats;
  const devices = toDeviceItems(stats.devices);
  const breakdowns = [
    { title: 'Países', items: toChartItems(stats.countries, 'country'), color: 'chart-2' },
    { title: 'Ciudades', items: toChartItems(stats.cities, 'city'), color: 'chart-5' },
    { title: 'Orígenes', items: toChartItems(stats.referrers, 'referrer'), color: 'chart-3' },
    { title: 'Navegadores', items: toChartItems(stats.browsers, 'browser'), color: 'chart-4' },
    { title: 'Sistemas operativos', items: toChartItems(stats.os, 'os'), color: 'chart-1' },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/70 link-underline hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Tus enlaces
        </Link>
        <h1 className="min-w-0 truncate font-heading text-2xl sm:text-3xl">
          <a
            href={`//${link.shortUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title={link.shortUrl}
            className="link-underline"
          >
            {link.shortUrl}
          </a>
        </h1>
        <p className="flex min-w-0 items-center gap-1.5 text-foreground/70">
          <CornerDownRight aria-hidden className="size-4 shrink-0" />
          <span className="sr-only">Destino:</span>
          <a
            href={link.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={link.fullUrl}
            className="truncate link-underline hover:text-foreground"
          >
            {link.fullUrl}
          </a>
        </p>
        <p className="text-sm text-foreground/70">
          Creado el {dateFormat.format(link.createdAt)} ·{' '}
          <span className="tabular-nums">{numberFormat(link.clicks)}</span>{' '}
          Clics en total
        </p>
      </header>

      <StatsCard title="Clics" description={RANGE}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-heading text-4xl tabular-nums">
            {numberFormat(total)}
          </span>
          <TrendBadge current={total} previous={previousTotal} />
        </div>
        <ClicksAreaChart data={series} />
      </StatsCard>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Dispositivos"
          description={RANGE}
          isEmpty={devices.length === 0}
        >
          <DevicesDonutChart data={devices} />
        </StatsCard>
        {breakdowns.map(({ title, items, color }) => (
          <StatsCard
            key={title}
            title={title}
            description={RANGE}
            isEmpty={items.length === 0}
          >
            <ClicksBarChart data={items} color={color} />
          </StatsCard>
        ))}
      </div>
    </div>
  );
}
