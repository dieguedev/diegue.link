'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';

interface CopyUrlButtonProps {
  address: string;
}

export function CopyUrlButton({ address }: CopyUrlButtonProps) {
  const t = useTranslations('Links.create');

  return (
    <div className="mt-6 flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">{t('result')}</p>
      <div className="flex items-center gap-2">
        <Input
          id="address"
          name="address"
          value={address}
          disabled
          className="flex-1"
        />
        <CopyLinkButton address={address} />
        <Button size="icon" variant="neutral" asChild>
          <a
            href={`//${address}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('open', { address })}
          >
            <LinkIcon className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
