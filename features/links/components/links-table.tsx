import { headers } from 'next/headers';
import { Link2, SearchX } from 'lucide-react';
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
import { listLinks } from '@/domain/services/url-service';
import { numberFormat } from '@/lib/utils/number-format';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';
import { EditLinkDialog } from '@/features/links/components/edit-link-dialog';
import { DeleteLinkDialog } from '@/features/links/components/delete-link-dialog';
import { LinkItem } from '@/features/links/components/link-item';
import { LinksPagination } from '@/features/links/components/links-pagination';
import { LinksSearch } from '@/features/links/components/links-search';

const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

interface LinksTableProps {
  userId: string;
  username: string;
  query?: string;
  page?: number;
}

export async function LinksTable({
  userId,
  username,
  query,
  page: requestedPage,
}: LinksTableProps) {
  const host = (await headers()).get('host') || 'diegue.link';
  const { links, total, page, pageCount } = await listLinks({
    userId,
    username,
    host,
    query,
    page: requestedPage,
  });
  const isSearching = Boolean(query?.trim());

  return (
    <section aria-labelledby="links-heading" className="flex flex-col gap-4">
      <h2 id="links-heading" className="text-2xl">
        Tus enlaces
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
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>
              Ningún enlace coincide con «{query?.trim()}». Prueba con otro
              alias o destino.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : total === 0 ? (
        <Empty className="bg-secondary-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Link2 />
            </EmptyMedia>
            <EmptyTitle>Aún no tienes enlaces</EmptyTitle>
            <EmptyDescription>
              Acorta tu primera URL con el formulario de arriba y aparecerá
              aquí, lista para editar o compartir.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ItemGroup className="md:hidden">
            {links.map(link => (
              <LinkItem
                key={link.id}
                link={link}
                createdAt={dateFormat.format(link.createdAt)}
              />
            ))}
          </ItemGroup>
          <div className="hidden shadow-shadow md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-main text-main-foreground">
                  <TableHead>Enlace</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                  <TableHead className="hidden md:table-cell">Creado</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map(link => (
                  <TableRow key={link.id} className="bg-secondary-background">
                    <TableCell className="py-3">
                      <a
                        href={`//${link.shortUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.shortUrl}
                        className="block max-w-[14rem] truncate font-heading underline-offset-4 hover:underline lg:max-w-xs"
                      >
                        {link.shortUrl}
                      </a>
                    </TableCell>
                    <TableCell className="py-3">
                      <a
                        href={link.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.fullUrl}
                        className="block max-w-[14rem] truncate text-foreground/70 underline-offset-4 hover:text-foreground hover:underline lg:max-w-sm"
                      >
                        {link.fullUrl}
                      </a>
                    </TableCell>
                    <TableCell className="py-3 text-right tabular-nums">
                      {numberFormat(link.clicks)}
                    </TableCell>
                    <TableCell className="hidden py-3 whitespace-nowrap tabular-nums md:table-cell">
                      {dateFormat.format(link.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end gap-2">
                        <CopyLinkButton
                          shortUrl={link.shortUrl}
                          className="size-9"
                        />
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
