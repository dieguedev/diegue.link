import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface LinksPaginationProps {
  page: number;
  pageCount: number;
  query?: string;
}

type PageSlot = number | 'ellipsis';

// Primera, última y las vecinas de la actual: 1 … 4 5 6 … 250
function getPageSlots(page: number, pageCount: number): PageSlot[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter(p => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  return sorted.flatMap<PageSlot>((p, i) => {
    const prev = sorted[i - 1];
    if (prev === undefined || p - prev === 1) return [p];
    // Si solo falta una página, se muestra en vez de los puntos suspensivos
    if (p - prev === 2) return [p - 1, p];
    return ['ellipsis', p];
  });
}

export function LinksPagination({
  page,
  pageCount,
  query,
}: LinksPaginationProps) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (target > 1) params.set('page', String(target));
    const qs = params.toString();
    return qs ? `?${qs}` : '?';
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={href(page - 1)}
            disabled={page <= 1}
            scroll={false}
          />
        </PaginationItem>

        {getPageSlots(page, pageCount).map((slot, i) =>
          slot === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`} className="hidden sm:block">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem
              key={slot}
              className={slot === page ? undefined : 'hidden sm:block'}
            >
              <PaginationLink
                href={href(slot)}
                isActive={slot === page}
                aria-label={`Página ${slot}`}
                scroll={false}
              >
                {slot}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem className="px-2 text-sm text-foreground/70 tabular-nums sm:hidden">
          de {pageCount}
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href={href(page + 1)}
            disabled={page >= pageCount}
            scroll={false}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
