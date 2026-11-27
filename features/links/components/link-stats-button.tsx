import Link from 'next/link';
import { ChartColumn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { LinkSummary } from '@/domain/links/link-service';

interface LinkStatsButtonProps {
  link: Pick<LinkSummary, 'id' | 'address'>;
}

export function LinkStatsButton({ link }: LinkStatsButtonProps) {
  const t = useTranslations('Links.stats');

  return (
    <Button asChild variant="neutral" size="icon" className="size-9">
      <Link
        href={`/dashboard/links/${link.id}`}
        aria-label={t('label', { address: link.address })}
        title={t('trigger')}
      >
        <ChartColumn />
      </Link>
    </Button>
  );
}
