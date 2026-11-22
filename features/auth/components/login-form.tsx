'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FieldMessage } from '@/components/ui/field-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/auth-client';
import { registerInline } from '@/lib/forms/register-inline';
import { shakeFields } from '@/lib/utils/shake';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { loginSchema, type LoginInput } from '@/features/auth/schemas';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;
  const field = registerInline(form);

  const onValid = async (data: LoginInput) => {
    try {
      const { error } = await authClient.signIn.email(data);
      if (error) {
        setError('root.server', { message: getAuthErrorMessage(error) });
        return;
      }
      onSuccess();
    } catch {
      setError('root.server', { message: getAuthErrorMessage({}) });
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
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="email@example.com"
            aria-invalid={!!errors.email}
            aria-describedby="login-email-message"
            {...field('email')}
          />
          <FieldMessage
            id="login-email-message"
            error={errors.email?.message}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="login-password">Contraseña</Label>
            <a href="#" className="ml-auto inline-block text-sm link-underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby="login-password-message"
            {...field('password')}
          />
          <FieldMessage
            id="login-password-message"
            error={errors.password?.message}
          />
        </div>

        {errors.root?.server && (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.server.message}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Iniciar sesión
        </Button>
      </fieldset>
    </form>
  );
}
