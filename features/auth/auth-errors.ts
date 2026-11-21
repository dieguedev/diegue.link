const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'El email o la contraseña no son correctos.',
  INVALID_EMAIL: 'El email no es válido.',
  PASSWORD_TOO_SHORT: 'La contraseña es demasiado corta.',
  PASSWORD_TOO_LONG: 'La contraseña es demasiado larga.',
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con ese email.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Ya existe una cuenta con ese email.',
  FAILED_TO_CREATE_USER:
    'No se pudo crear la cuenta. Puede que el nombre de usuario ya esté en uso.',
};

const TOO_MANY_REQUESTS_MESSAGE =
  'Demasiados intentos. Espera un momento y vuelve a probar.';
const FALLBACK_MESSAGE = 'Algo ha fallado. Inténtalo de nuevo.';

interface AuthError {
  code?: string;
  status?: number;
}

export function getAuthErrorMessage(error: AuthError): string {
  if (error.status === 429) return TOO_MANY_REQUESTS_MESSAGE;
  return (error.code && AUTH_ERROR_MESSAGES[error.code]) || FALLBACK_MESSAGE;
}
