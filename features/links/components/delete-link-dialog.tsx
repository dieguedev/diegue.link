'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import {
  useLinkErrorMessage,
  type LinkActionError,
} from '@/features/links/link-errors';
import type { LinkSummary } from '@/domain/links/link-service';

type DeletableLink = Pick<LinkSummary, 'id' | 'address'>;

export function DeleteLinkDialog({ link }: { link: DeletableLink }) {
  const t = useTranslations('Links.delete');
  const errorMessage = useLinkErrorMessage();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<LinkActionError>();
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
            aria-label={t('label', { address: link.address })}
            title={t('trigger')}
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
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich('description', {
              address: () => (
                <span className="font-heading break-all">{link.address}</span>
              ),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FieldMessage
          id={errorId}
          error={error && errorMessage(error)}
          className="text-center"
        />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('cancel')}
          </AlertDialogCancel>
          <Button
            onClick={handleDelete}
            loading={isPending}
            aria-describedby={error ? errorId : undefined}
          >
            {t('submit')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
