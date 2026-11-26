import Link from 'next/link';
import { ChartColumn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LinkSummary } from '@/domain/links/link-service';

interface LinkStatsButtonProps {
  link: Pick<LinkSummary, 'id' | 'address'>;
}

export function LinkStatsButton({ link }: LinkStatsButtonProps) {
  return (
    <Button asChild variant="neutral" size="icon" className="size-9">
      <Link
        href={`/dashboard/links/${link.id}`}
        aria-label={`Estadísticas de ${link.address}`}
        title="Estadísticas"
      >
        <ChartColumn />
      </Link>
    </Button>
  );
}
