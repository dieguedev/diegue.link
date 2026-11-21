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
import { registerSchema, type RegisterInput } from '@/features/auth/schemas';

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
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
          <Label htmlFor="register-name">Nombre</Label>
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
          <Label htmlFor="register-email">Email</Label>
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
          <Label htmlFor="register-username">Nombre de usuario</Label>
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
            hint="Entre 3 y 30 caracteres."
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-password">Contraseña</Label>
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
            hint="Mínimo 8 caracteres."
          />
        </div>

        {errors.root?.server && (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.server.message}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Crear cuenta
        </Button>
      </fieldset>
    </form>
  );
}
