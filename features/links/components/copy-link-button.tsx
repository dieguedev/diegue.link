'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

interface CopyLinkButtonProps {
  address: string;
  className?: string;
}

const COPIED_DURATION_MS = 2000;

export function CopyLinkButton({ address, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const toastId = `copy-${address}`;

    try {
      await navigator.clipboard.writeText(address);
    } catch {
      toast.add({
        id: toastId,
        type: 'error',
        title: 'No se pudo copiar el enlace',
        description: 'Tu navegador ha bloqueado el portapapeles.',
      });
      return;
    }

    toast.add({
      id: toastId,
      type: 'success',
      title: 'Enlace copiado',
      description: address,
      timeout: COPIED_DURATION_MS,
    });

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), COPIED_DURATION_MS);
  };

  return (
    <Button
      type="button"
      variant="neutral"
      size="icon"
      className={className}
      onClick={handleCopy}
      aria-label={`Copiar ${address}`}
      title={copied ? 'Copiado' : 'Copiar'}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}
