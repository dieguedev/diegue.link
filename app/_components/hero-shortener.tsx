'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon } from 'lucide-react';
import { DotLoader } from '@/components/ui/dot-loader';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { createLink } from '@/features/links/actions/create-link';
import { CopyLinkButton } from '@/features/links/components/copy-link-button';
import { shake } from '@/lib/utils/shake';

const EMPTY_ERROR = 'Pega un enlace para acortarlo.';
const INVALID_ERROR = 'Ese enlace no parece válido.';

function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
    ? value
    : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.hostname.includes('.') ? url.toString() : null;
  } catch {
    return null;
  }
}

interface HeroShortenerProps {
  isLoggedIn: boolean;
}

export function HeroShortener({ isLoggedIn }: HeroShortenerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fail = (message: string) => {
    setError(message);
    const group = inputRef.current?.closest('[data-slot="input-group"]');
    if (group) shake(group);
  };

  const readUrl = () => {
    const raw = inputRef.current?.value ?? '';
    const url = normalizeUrl(raw);
    if (!url) {
      fail(raw.trim() ? INVALID_ERROR : EMPTY_ERROR);
      inputRef.current?.focus();
    }
    return url;
  };

  const shorten = (url: string, { afterLogin = false } = {}) => {
    const formData = new FormData();
    formData.set('url', url);

    startTransition(async () => {
      const result = await createLink(formData);
      if (result.status === 'success') {
        setShortUrl(result.shortUrl);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
      } else if (result.status === 'error') {
        fail(result.error);
      }
      if (afterLogin) router.refresh();
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = readUrl();
    if (!url) return;
    if (isLoggedIn) shorten(url);
    else setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    const url = readUrl();
    if (url) shorten(url, { afterLogin: true });
    else router.refresh();
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="hero-url" className="sr-only">
          Enlace a acortar
        </label>
        <InputGroup
          className="max-sm:h-auto max-sm:flex-col sm:h-14"
        >
          <InputGroupInput
            ref={inputRef}
            id="hero-url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Pega aquí tu enlace largo"
            aria-invalid={!!error}
            aria-describedby={error ? 'hero-url-error' : undefined}
            onChange={() => error && setError(null)}
            disabled={isPending}
            className="h-14 px-4 text-base max-sm:flex-none max-sm:short:h-12 sm:h-full md:text-lg"
          />
          <InputGroupAddon
            align="inline-end"
            className="max-sm:w-full max-sm:self-stretch"
          >
            <InputGroupButton
              type="submit"
              variant="default"
              disabled={isPending}
              aria-busy={isPending || undefined}
              className="relative gap-2 px-5! text-base max-sm:h-12! max-sm:short:h-11! max-sm:w-full max-sm:rounded-none! max-sm:border-t-2! max-sm:border-l-0! md:text-lg"
            >
              <span
                className={`inline-flex items-center gap-2 ${isPending ? 'invisible' : ''}`}
              >
                Acortar
                <LinkIcon aria-hidden="true" />
              </span>
              {isPending && (
                <DotLoader
                  label="Acortando"
                  className="absolute inset-0 justify-center"
                />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {error && (
          <p
            id="hero-url-error"
            role="alert"
            className="mt-2 text-left text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </form>

      {shortUrl && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-base border-2 border-border bg-secondary-background py-2 pr-2 pl-4 text-left"
        >
          <a
            href={`//${shortUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate font-heading underline-offset-4 hover:underline"
          >
            {shortUrl}
          </a>
          <CopyLinkButton shortUrl={shortUrl} className="size-9 shrink-0" />
        </div>
      )}

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
