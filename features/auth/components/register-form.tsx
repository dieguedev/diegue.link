'use client';

import { useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FieldMessage } from '@/components/ui/field-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/auth-client';
import { registerInline } from '@/lib/forms/register-inline';
import { shakeFields } from '@/lib/utils/shake';
import { useAuthErrorMessage } from '@/features/auth/auth-errors';
import {
  createRegisterSchema,
  type RegisterInput,
} from '@/features/auth/schemas';

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const t = useTranslations('Auth');
  const tValidation = useTranslations('Auth.validation');
  const authErrorMessage = useAuthErrorMessage();
  const schema = useMemo(
    () => createRegisterSchema(tValidation),
    [tValidation],
  );
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;
  const field = registerInline(form);

  const onValid = async (data: RegisterInput) => {
    try {
      const { error } = await authClient.signUp.email(data);
      if (error) {
        setError('root.server', { message: authErrorMessage(error) });
        return;
      }
      onSuccess();
    } catch {
      setError('root.server', { message: authErrorMessage({}) });
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onValid, invalid =>
        shakeFields(formRef.current, Object.keys(invalid)),
      )}
      noValidate
    >
      <fieldset disabled={isSubmitting} className="flex min-w-0 flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="register-name">{t('register.name')}</Label>
          <Input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            aria-invalid={!!errors.name}
            aria-describedby="register-name-message"
            {...field('name')}
          />
          <FieldMessage
            id="register-name-message"
            error={errors.name?.message}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-email">{t('register.email')}</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="email@example.com"
            aria-invalid={!!errors.email}
            aria-describedby="register-email-message"
            {...field('email')}
          />
          <FieldMessage
            id="register-email-message"
            error={errors.email?.message}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-username">{t('register.username')}</Label>
          <Input
            id="register-username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!errors.username}
            aria-describedby="register-username-message"
            {...field('username')}
          />
          <FieldMessage
            id="register-username-message"
            error={errors.username?.message}
            hint={t('register.usernameHint')}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-password">{t('register.password')}</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            aria-invalid={!!errors.password}
            aria-describedby="register-password-message"
            {...field('password')}
          />
          <FieldMessage
            id="register-password-message"
            error={errors.password?.message}
            hint={t('register.passwordHint')}
          />
        </div>

        {errors.root?.server && (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.server.message}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {t('register.submit')}
        </Button>
      </fieldset>
    </form>
  );
}
