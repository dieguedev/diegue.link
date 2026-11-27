import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface TrendBadgeProps {
  current: number;
  previous: number;
}

export function TrendBadge({ current, previous }: TrendBadgeProps) {
  const t = useTranslations('Clicks.trend');

  // Sin periodo anterior no hay porcentaje que tenga sentido
  if (previous === 0) {
    if (current === 0) return null;
    return (
      <Badge className="bg-chart-4">
        <TrendingUp aria-hidden />
        {t('new')}
      </Badge>
    );
  }

  const change = Math.round(((current - previous) / previous) * 100);
  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <Badge
      className={cn(
        change > 0 && 'bg-chart-4',
        change < 0 && 'bg-main',
        change === 0 && 'bg-secondary-background',
      )}
    >
      <Icon aria-hidden />
      {change > 0 ? '+' : ''}
      {change}%<span className="sr-only">{t('comparison')}</span>
    </Badge>
  );
}

function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-base border-2 border-border px-2 py-0.5 font-heading text-sm text-main-foreground tabular-nums [&_svg]:size-4',
        className,
      )}
    >
      {children}
    </span>
  );
}
