import type { Locale } from '@/lib/i18n/locale';
import type messages from '@/messages/es.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
