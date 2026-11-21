import NextLink from 'next/link';
import { headers } from 'next/headers';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/shared/auth-modal/auth-modal';
import { auth } from '@/lib/auth/auth';

function HeroCtaLabel() {
  return (
    <span className="flex items-center gap-2 text-lg md:text-xl 2xl:text-2xl">
      Acortar
      <LinkIcon aria-hidden="true" />
    </span>
  );
}

export async function HeroCta() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    return (
      <Button size="hero" asChild>
        <NextLink href="/dashboard">
          <HeroCtaLabel />
        </NextLink>
      </Button>
    );
  }

  return (
    <AuthModal
      trigger={
        <Button size="hero">
          <HeroCtaLabel />
        </Button>
      }
    />
  );
}
