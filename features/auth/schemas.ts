import { z } from 'zod';
import type { useTranslations } from 'next-intl';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

type Translate = ReturnType<typeof useTranslations<'Auth.validation'>>;

function emailSchema(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, t('emailRequired'))
    .pipe(z.email(t('emailInvalid')));
}

export function createLoginSchema(t: Translate) {
  return z.object({
    email: emailSchema(t),
    password: z.string().min(1, t('passwordRequired')),
  });
}

export function createRegisterSchema(t: Translate) {
  return z.object({
    name: z.string().trim().min(1, t('nameRequired')),
    email: emailSchema(t),
    username: z
      .string()
      .trim()
      .min(USERNAME_MIN_LENGTH, t('minLength', { min: USERNAME_MIN_LENGTH }))
      .max(USERNAME_MAX_LENGTH, t('maxLength', { max: USERNAME_MAX_LENGTH }))
      .regex(/^[a-zA-Z0-9_-]+$/, t('usernameChars')),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, t('minLength', { min: PASSWORD_MIN_LENGTH }))
      .max(PASSWORD_MAX_LENGTH, t('maxLength', { max: PASSWORD_MAX_LENGTH })),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;
