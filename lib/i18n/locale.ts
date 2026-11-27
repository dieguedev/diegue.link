export const LOCALES = ['es', 'ca'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

function languagesByPreference(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map(entry => {
      const [tag, ...params] = entry.trim().split(';');
      const quality = params
        .map(param => param.trim())
        .find(param => param.startsWith('q='));
      return {
        language: tag.split('-')[0].toLowerCase(),
        quality: quality ? Number(quality.slice(2)) : 1,
      };
    })
    .filter(({ quality }) => quality > 0)
    .sort((a, b) => b.quality - a.quality)
    .map(({ language }) => language);
}

export function resolveLocale({
  cookie,
  acceptLanguage,
}: {
  cookie?: string;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(cookie)) return cookie;
  return (
    languagesByPreference(acceptLanguage ?? '').find(isLocale) ?? DEFAULT_LOCALE
  );
}
