'use server';

import { cookies } from 'next/headers';
import { isLocale, LOCALE_COOKIE } from '@/lib/i18n/locale';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: 'lax',
  });
}
