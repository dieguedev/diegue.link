'use client';

import { useActionState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createLink, type CreateLinkResult } from '@/features/links/actions/create-link';
import { CopyUrlButton } from '@/features/links/components/copy-url-button';

export function CreateLinkForm() {
  const [state, formAction, isPending] = useActionState<
    CreateLinkResult,
    FormData
  >(
    async (_prevState, formData) => {
      return await createLink(formData);
    },
    { status: 'idle' },
  );

  const shortUrl = state.status === 'success' ? state.shortUrl : null;

  return (
    <Card variant="secondary" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Acorta una URL</CardTitle>
        <CardDescription>
          Añade la URL a acortar para generar un enlace corto. Puedes añadir un
          alias personalizado para que sea más descriptivo o más fácil de
          recordar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL a acortar</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://example.com/very/long/url"
              required
              type="url"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Alias personalizado (opcional)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="mi-enlace"
              pattern="[a-zA-Z0-9-_]+"
              title="Solo letras, números, guiones y guiones bajos"
              disabled={isPending}
            />
          </div>

          {state.status === 'error' && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Acortando...' : 'Acortar URL'}
          </Button>
        </form>

        {shortUrl && <CopyUrlButton shortUrl={shortUrl} />}
      </CardContent>
    </Card>
  );
}
