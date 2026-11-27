import { useTranslations } from 'next-intl';

const KNOWN_CODES = [
  'INVALID_EMAIL_OR_PASSWORD',
  'INVALID_EMAIL',
  'PASSWORD_TOO_SHORT',
  'PASSWORD_TOO_LONG',
  'USER_ALREADY_EXISTS',
  'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
  'FAILED_TO_CREATE_USER',
] as const;

type KnownCode = (typeof KNOWN_CODES)[number];

interface AuthError {
  code?: string;
  status?: number;
}

function isKnownCode(code: string | undefined): code is KnownCode {
  return KNOWN_CODES.includes(code as KnownCode);
}

export function useAuthErrorMessage() {
  const t = useTranslations('Auth.errors');

  return (error: AuthError): string => {
    if (error.status === 429) return t('TOO_MANY_REQUESTS');
    if (isKnownCode(error.code)) return t(error.code);
    return t('FALLBACK');
  };
}
