import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import StarWithStroke from '@/components/ui/star-with-stroke';
import { auth } from '@/lib/auth/auth';
import { ClosingCtaButton } from '@/app/_components/closing-cta-button';

export async function ClosingCta() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = !!session;
  const t = await getTranslations(
    isLoggedIn ? 'ClosingCta.loggedIn' : 'ClosingCta.loggedOut',
  );

  return (
    <section
      aria-labelledby="cierre-title"
      className="relative overflow-hidden border-b-2 border-border bg-main"
    >
      <StarWithStroke
        starNumber={16}
        size={120}
        color="var(--secondary-background)"
        aria-hidden
        className="absolute -left-8 top-8 hidden motion-safe:animate-star-spin md:block"
      />
      <StarWithStroke
        starNumber={27}
        size={96}
        color="var(--secondary-background)"
        aria-hidden
        className="absolute -right-6 bottom-8 hidden motion-safe:animate-star-spin [animation-direction:reverse] md:block"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
        <h2
          id="cierre-title"
          className="text-4xl font-bold leading-[1.1] tracking-tight text-main-foreground sm:text-5xl lg:text-7xl"
        >
          {t('title')}
        </h2>
        <p className="max-w-xl text-base text-main-foreground sm:text-xl">
          {t('text')}
        </p>
        <ClosingCtaButton isLoggedIn={isLoggedIn} label={t('button')} />
      </div>
    </section>
  );
}
