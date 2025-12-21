'use client';

import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyUrlButtonProps {
  shortUrl: string;
}

export function CopyUrlButton({ shortUrl }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-6 p-4 bg-muted rounded-lg border flex flex-col gap-2">
      <p className="text-sm font-medium text-muted-foreground">Tu enlace corto:</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 p-2 bg-background rounded border font-mono text-sm truncate">
          {shortUrl}
        </div>
        <Button size="icon" variant="neutral" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="neutral" asChild>
          <a href={`//${shortUrl}`} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
