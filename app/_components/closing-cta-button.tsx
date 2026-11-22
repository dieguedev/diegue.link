'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/features/auth/components/auth-modal';

const BUTTON_CLASS = 'text-base max-sm:w-full md:text-lg';

interface ClosingCtaButtonProps {
  isLoggedIn: boolean;
}

export function ClosingCtaButton({ isLoggedIn }: ClosingCtaButtonProps) {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <Button asChild variant="neutral" size="hero" className={BUTTON_CLASS}>
        <Link href="/dashboard">
          Ir a mi panel
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    );
  }

  return (
    <AuthModal
      onSuccess={() => {
        router.push('/dashboard');
        router.refresh();
      }}
      trigger={
        <Button variant="neutral" size="hero" className={BUTTON_CLASS}>
          Empezar gratis
          <LogIn aria-hidden="true" />
        </Button>
      }
    />
  );
}
