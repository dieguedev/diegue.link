'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
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
import {
  createLink,
  type CreateLinkResult,
} from '@/features/links/actions/create-link';
import { CopyUrlButton } from '@/features/links/components/copy-url-button';
import { useLinkErrorMessage } from '@/features/links/link-errors';
import { parseDestination } from '@/domain/links/destination';
import { parseAlias } from '@/domain/links/alias';

export function CreateLinkForm() {
  const t = useTranslations('Links');
  const errorMessage = useLinkErrorMessage();
  const [state, formAction, isPending] = useActionState<
    CreateLinkResult,
    FormData
  >(
    async (_prevState, formData) => {
      const destination = parseDestination(formData.get('url'));
      if (destination.status === 'invalid')
        return { status: 'error', error: destination.error };
      const slug = formData.get('slug')?.toString().trim();
      if (slug) {
        const alias = parseAlias(slug);
        if (alias.status === 'invalid')
          return { status: 'error', error: alias.error };
      }
      return await createLink(formData);
    },
    { status: 'idle' },
  );

  const address = state.status === 'success' ? state.link.address : null;

  return (
    <Card variant="secondary" className="w-full">
      <CardHeader>
        <CardTitle>{t('create.title')}</CardTitle>
        <CardDescription>{t('create.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">{t('create.url')}</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://example.com/very/long/url"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">{t('create.alias')}</Label>
            <Input
              id="slug"
              name="slug"
              placeholder={t('create.aliasPlaceholder')}
              disabled={isPending}
            />
          </div>

          {state.status === 'error' && (
            <p className="text-sm text-red-500">{errorMessage(state.error)}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? t('create.pending') : t('create.submit')}
          </Button>
        </form>

        {address && <CopyUrlButton address={address} />}
      </CardContent>
    </Card>
  );
}
