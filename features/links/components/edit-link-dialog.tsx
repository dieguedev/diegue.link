'use client';

import { useActionState, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldMessage } from '@/components/ui/field-message';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
  updateLink,
  type UpdateLinkResult,
} from '@/features/links/actions/update-link';
import { useLinkErrorMessage } from '@/features/links/link-errors';
import type { LinkSummary } from '@/domain/links/link-service';
import { parseDestination } from '@/domain/links/destination';
import { parseAlias } from '@/domain/links/alias';

type EditableLink = Pick<LinkSummary, 'id' | 'slug' | 'fullUrl' | 'address'>;

export function EditLinkDialog({ link }: { link: EditableLink }) {
  const t = useTranslations('Links.edit');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
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
        <Pencil />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" closeLabel={t('close')}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <EditLinkForm link={link} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditLinkForm({
  link,
  onSuccess,
}: {
  link: EditableLink;
  onSuccess: () => void;
}) {
  const t = useTranslations('Links');
  const errorMessage = useLinkErrorMessage();
  const [state, formAction, isPending] = useActionState<
    UpdateLinkResult,
    FormData
  >(
    async (_prevState, formData) => {
      const destination = parseDestination(formData.get('url'));
      if (destination.status === 'invalid')
        return { status: 'error', error: destination.error };
      const alias = parseAlias(formData.get('slug'));
      if (alias.status === 'invalid')
        return { status: 'error', error: alias.error };
      const result = await updateLink(formData);
      if (result.status === 'success') onSuccess();
      return result;
    },
    { status: 'idle' },
  );

  const prefix = link.address.slice(0, -link.slug.length);
  const error =
    state.status === 'error' ? errorMessage(state.error) : undefined;
  const errorId = `edit-link-error-${link.id}`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={link.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-url-${link.id}`}>{t('edit.destination')}</Label>
        <Input
          id={`edit-url-${link.id}`}
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue={link.fullUrl}
          disabled={isPending}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-slug-${link.id}`}>{t('edit.alias')}</Label>
        <InputGroup>
          <InputGroupAddon className="max-w-[60%] shrink-0 pl-3" title={prefix}>
            <span className="truncate text-foreground/60">{prefix}</span>
          </InputGroupAddon>
          <InputGroupInput
            id={`edit-slug-${link.id}`}
            name="slug"
            defaultValue={link.slug}
            disabled={isPending}
            className="min-w-0 pl-0!"
            aria-describedby={error ? errorId : undefined}
          />
        </InputGroup>
      </div>

      <FieldMessage id={errorId} error={error} />

      <DialogFooter className="mt-2">
        <DialogClose
          render={
            <Button type="button" variant="neutral" disabled={isPending} />
          }
        >
          {t('edit.cancel')}
        </DialogClose>
        <Button type="submit" loading={isPending}>
          {t('edit.submit')}
        </Button>
      </DialogFooter>
    </form>
  );
}
