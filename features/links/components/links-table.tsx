import { headers } from 'next/headers';
import { Link2 } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
import { EditLinkDialog } from '@/features/links/components/edit-link-dialog';
import { DeleteLinkDialog } from '@/features/links/components/delete-link-dialog';

const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

interface LinksTableProps {
  userId: string;
  username: string;
}

export async function LinksTable({ userId, username }: LinksTableProps) {
  const host = (await headers()).get('host') || 'diegue.link';
  const links = await listLinks({ userId, username, host });

  return (
    <section aria-labelledby="links-heading" className="flex flex-col gap-4">
      <h2 id="links-heading" className="text-2xl">
        Tus enlaces
        {links.length > 0 && (
          <span className="ml-2 font-base text-foreground/70 tabular-nums">
            {links.length}
          </span>
        )}
      </h2>

      {links.length === 0 ? (
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
        <div className="shadow-shadow">
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
                      <EditLinkDialog link={link} />
                      <DeleteLinkDialog link={link} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
