import Link from 'next/link';
import { ChartColumn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LinkSummary } from '@/domain/services/url-service';

interface LinkStatsButtonProps {
  link: Pick<LinkSummary, 'id' | 'shortUrl'>;
}

export function LinkStatsButton({ link }: LinkStatsButtonProps) {
  return (
    <Button asChild variant="neutral" size="icon" className="size-9">
      <Link
        href={`/dashboard/links/${link.id}`}
        aria-label={`Estadísticas de ${link.shortUrl}`}
        title="Estadísticas"
      >
        <ChartColumn />
      </Link>
    </Button>
  );
}
