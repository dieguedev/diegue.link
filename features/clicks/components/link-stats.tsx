import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CornerDownRight } from 'lucide-react';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import {
  getLinkStats,
  STATS_RANGE_DAYS,
} from '@/domain/services/stats-service';
import { numberFormat } from '@/lib/utils/number-format';
import {
  toChartItems,
  toDeviceItems,
  type BreakdownKind,
} from '@/features/clicks/labels';
import { ClicksAreaChart } from '@/features/clicks/components/clicks-area-chart';
import { ClicksBarChart } from '@/features/clicks/components/clicks-bar-chart';
import { DevicesDonutChart } from '@/features/clicks/components/devices-donut-chart';
import { StatsCard } from '@/features/clicks/components/stats-card';
import { TrendBadge } from '@/features/clicks/components/trend-badge';

interface LinkStatsProps {
  id: number;
  userId: string;
}

export async function LinkStats({ id, userId }: LinkStatsProps) {
  const stats = await getLinkStats({ id, userId });
  if (!stats) notFound();

  const t = await getTranslations('Clicks');
  const locale = await getLocale();
  const format = await getFormatter();
  const range = t('range', { days: STATS_RANGE_DAYS });

  const chartItems = (
    items: Parameters<typeof toChartItems>[0],
    kind: BreakdownKind,
  ) =>
    toChartItems(items, kind, {
      locale,
      other: t('labels.other'),
      unknown: t(`labels.unknown.${kind}`),
    });

  const { link, series, total, previousTotal } = stats;
  const devices = toDeviceItems(stats.devices);
  const breakdowns = [
    {
      title: t('breakdowns.countries'),
      items: chartItems(stats.countries, 'country'),
      color: 'chart-2',
    },
    {
      title: t('breakdowns.cities'),
      items: chartItems(stats.cities, 'city'),
      color: 'chart-5',
    },
    {
      title: t('breakdowns.referrers'),
      items: chartItems(stats.referrers, 'referrer'),
      color: 'chart-3',
    },
    {
      title: t('breakdowns.browsers'),
      items: chartItems(stats.browsers, 'browser'),
      color: 'chart-4',
    },
    {
      title: t('breakdowns.os'),
      items: chartItems(stats.os, 'os'),
      color: 'chart-1',
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/70 link-underline hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('link.back')}
        </Link>
        <h1 className="min-w-0 truncate font-heading text-2xl sm:text-3xl">
          <a
            href={`//${link.address}`}
            target="_blank"
            rel="noopener noreferrer"
            title={link.address}
            className="link-underline"
          >
            {link.address}
          </a>
        </h1>
        <p className="flex min-w-0 items-center gap-1.5 text-foreground/70">
          <CornerDownRight aria-hidden className="size-4 shrink-0" />
          <span className="sr-only">{t('link.destination')}</span>
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
          {t.rich('link.summary', {
            date: format.dateTime(link.createdAt, { dateStyle: 'long' }),
            clicks: numberFormat(link.clicks),
            count: chunks => <span className="tabular-nums">{chunks}</span>,
          })}
        </p>
      </header>

      <StatsCard title={t('clicks')} description={range}>
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
          title={t('breakdowns.devices')}
          description={range}
          isEmpty={devices.length === 0}
        >
          <DevicesDonutChart data={devices} />
        </StatsCard>
        {breakdowns.map(({ title, items, color }) => (
          <StatsCard
            key={title}
            title={title}
            description={range}
            isEmpty={items.length === 0}
          >
            <ClicksBarChart data={items} color={color} />
          </StatsCard>
        ))}
      </div>
    </div>
  );
}
