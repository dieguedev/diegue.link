import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, resolveLocale, type Locale } from '@/lib/i18n/locale';

const MESSAGES = {
  es: () => import('@/messages/es.json'),
  ca: () => import('@/messages/ca.json'),
} satisfies Record<Locale, unknown>;

export default getRequestConfig(async () => {
  const locale = resolveLocale({
    cookie: (await cookies()).get(LOCALE_COOKIE)?.value,
    acceptLanguage: (await headers()).get('accept-language'),
  });

  return {
    locale,
    timeZone: 'Europe/Madrid',
    messages: (await MESSAGES[locale]()).default,
  };
});
