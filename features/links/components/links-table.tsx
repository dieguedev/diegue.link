import { Link2, SearchX } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ItemGroup } from '@/components/ui/item';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listLinks } from '@/domain/links/link-service';
import { numberFormat } from '@/lib/utils/number-format';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';
import { EditLinkDialog } from '@/features/links/components/edit-link-dialog';
import { DeleteLinkDialog } from '@/features/links/components/delete-link-dialog';
import { LinkStatsButton } from '@/features/links/components/link-stats-button';
import { LinkItem } from '@/features/links/components/link-item';
import { LinksPagination } from '@/features/links/components/links-pagination';
import { LinksSearch } from '@/features/links/components/links-search';

interface LinksTableProps {
  userId: string;
  query?: string;
  page?: number;
}

export async function LinksTable({
  userId,
  query,
  page: requestedPage,
}: LinksTableProps) {
  const { links, total, page, pageCount } = await listLinks({
    userId,
    query,
    page: requestedPage,
  });
  const isSearching = Boolean(query?.trim());
  const t = await getTranslations('Links.list');
  const format = await getFormatter();
  const createdAt = (date: Date) =>
    format.dateTime(date, { dateStyle: 'medium' });

  return (
    <section aria-labelledby="links-heading" className="flex flex-col gap-4">
      <h2 id="links-heading" className="text-2xl">
        {t('title')}
        {total > 0 && (
          <span className="ml-2 font-base text-foreground/70 tabular-nums">
            {numberFormat(total)}
          </span>
        )}
      </h2>

      {(total > 0 || isSearching) && <LinksSearch />}

      {total === 0 && isSearching ? (
        <Empty className="bg-secondary-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>{t('noResultsTitle')}</EmptyTitle>
            <EmptyDescription>
              {t('noResultsDescription', { query: query?.trim() ?? '' })}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : total === 0 ? (
        <Empty className="bg-secondary-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Link2 />
            </EmptyMedia>
            <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ItemGroup className="md:hidden">
            {links.map(link => (
              <LinkItem
                key={link.id}
                link={link}
                createdAt={createdAt(link.createdAt)}
              />
            ))}
          </ItemGroup>
          <div className="hidden shadow-shadow md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-main text-main-foreground">
                  <TableHead>{t('link')}</TableHead>
                  <TableHead>{t('destination')}</TableHead>
                  <TableHead className="text-right">{t('clicks')}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t('created')}
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">{t('actions')}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map(link => (
                  <TableRow key={link.id} className="bg-secondary-background">
                    <TableCell className="py-3">
                      <a
                        href={`//${link.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.address}
                        className="inline-block max-w-[14rem] truncate align-bottom font-heading link-underline lg:max-w-xs"
                      >
                        {link.address}
                      </a>
                    </TableCell>
                    <TableCell className="py-3">
                      <a
                        href={link.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.fullUrl}
                        className="inline-block max-w-[14rem] truncate align-bottom text-foreground/70 link-underline hover:text-foreground lg:max-w-sm"
                      >
                        {link.fullUrl}
                      </a>
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums">
                      {numberFormat(link.clicks)}
                    </TableCell>
                    <TableCell className="hidden py-3 whitespace-nowrap tabular-nums md:table-cell">
                      {createdAt(link.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end gap-2">
                        <CopyLinkButton
                          address={link.address}
                          className="size-9"
                        />
                        <LinkStatsButton link={link} />
                        <EditLinkDialog link={link} />
                        <DeleteLinkDialog link={link} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <LinksPagination
            page={page}
            pageCount={pageCount}
            query={query?.trim()}
          />
        </>
      )}
    </section>
  );
}
