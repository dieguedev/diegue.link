import { useTranslations } from 'next-intl';
import type { LinkError } from '@/domain/links/link-service';

export type LinkActionError = LinkError | 'UNAUTHORIZED' | 'INVALID_LINK';

export function useLinkErrorMessage() {
  const t = useTranslations('Links.errors');
  return (error: LinkActionError) => t(error);
}
