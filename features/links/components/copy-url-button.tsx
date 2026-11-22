'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon } from 'lucide-react';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';

interface CopyUrlButtonProps {
  shortUrl: string;
}

export function CopyUrlButton({ shortUrl }: CopyUrlButtonProps) {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">
        Tu enlace corto:
      </p>
      <div className="flex items-center gap-2">
        <Input
          id="shortUrl"
          name="shortUrl"
          value={shortUrl}
          disabled
          className="flex-1"
        />
        <CopyLinkButton shortUrl={shortUrl} />
        <Button size="icon" variant="neutral" asChild>
          <a href={`//${shortUrl}`} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
