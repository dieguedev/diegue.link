import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { HeroShortener } from '@/app/_components/hero-shortener';

export async function HeroCta() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <HeroShortener isLoggedIn={!!session} />;
}
