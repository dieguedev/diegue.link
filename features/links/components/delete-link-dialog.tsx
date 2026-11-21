'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FieldMessage } from '@/components/ui/field-message';
import { deleteLink } from '@/features/links/actions/delete-link';
import type { LinkSummary } from '@/domain/services/url-service';

type DeletableLink = Pick<LinkSummary, 'id' | 'shortUrl'>;

export function DeleteLinkDialog({ link }: { link: DeletableLink }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) setError(undefined);
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLink(link.id);
      if (result.status === 'success') setOpen(false);
      else setError(result.error);
    });
  };

  const errorId = `delete-link-error-${link.id}`;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            variant="neutral"
            size="icon"
            className="size-9"
            aria-label={`Eliminar ${link.shortUrl}`}
            title="Eliminar"
          />
        }
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Eliminar este enlace?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-heading break-all">{link.shortUrl}</span>{' '}
            dejará de redirigir y perderás sus clics. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FieldMessage id={errorId} error={error} className="text-center" />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            loading={isPending}
            aria-describedby={error ? errorId : undefined}
          >
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
