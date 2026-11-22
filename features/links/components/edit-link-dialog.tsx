'use client';

import { useActionState, useState } from 'react';
import { Pencil } from 'lucide-react';
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
import type { LinkSummary } from '@/domain/services/url-service';

type EditableLink = Pick<LinkSummary, 'id' | 'slug' | 'fullUrl' | 'shortUrl'>;

export function EditLinkDialog({ link }: { link: EditableLink }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="neutral"
            size="icon"
            className="size-9"
            aria-label={`Editar ${link.shortUrl}`}
            title="Editar"
          />
        }
      >
        <Pencil />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar enlace</DialogTitle>
          <DialogDescription>
            Cambia el destino o el alias. Si cambias el alias, el enlace
            anterior dejará de funcionar.
          </DialogDescription>
        </DialogHeader>
        {/* Se monta en cada apertura, así los errores no sobreviven al cierre */}
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
  const [state, formAction, isPending] = useActionState<
    UpdateLinkResult,
    FormData
  >(
    async (_prevState, formData) => {
      const result = await updateLink(formData);
      if (result.status === 'success') onSuccess();
      return result;
    },
    { status: 'idle' },
  );

  const prefix = link.shortUrl.slice(0, -link.slug.length);
  const error = state.status === 'error' ? state.error : undefined;
  const errorId = `edit-link-error-${link.id}`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={link.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-url-${link.id}`}>Destino</Label>
        <Input
          id={`edit-url-${link.id}`}
          name="url"
          type="url"
          required
          defaultValue={link.fullUrl}
          disabled={isPending}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-slug-${link.id}`}>Alias</Label>
        <InputGroup>
          <InputGroupAddon className="max-w-[60%] shrink-0 pl-3" title={prefix}>
            <span className="truncate text-foreground/60">{prefix}</span>
          </InputGroupAddon>
          <InputGroupInput
            id={`edit-slug-${link.id}`}
            name="slug"
            required
            maxLength={50}
            pattern="[a-zA-Z0-9\-_]+"
            title="Solo letras, números, guiones y guiones bajos"
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
          Cancelar
        </DialogClose>
        <Button type="submit" loading={isPending}>
          Guardar cambios
        </Button>
      </DialogFooter>
    </form>
  );
}
