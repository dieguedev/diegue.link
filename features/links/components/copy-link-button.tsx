'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyLinkButtonProps {
  shortUrl: string;
  className?: string;
}

const COPIED_DURATION_MS = 2000;

export function CopyLinkButton({ shortUrl, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
    } catch {
      return;
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), COPIED_DURATION_MS);
  };

  return (
    <>
      <Button
        type="button"
        variant="neutral"
        size="icon"
        className={className}
        onClick={handleCopy}
        aria-label={`Copiar ${shortUrl}`}
        title={copied ? 'Copiado' : 'Copiar'}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
      <span role="status" className="sr-only">
        {copied ? 'Enlace copiado' : ''}
      </span>
    </>
  );
}
