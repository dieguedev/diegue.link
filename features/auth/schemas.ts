import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const email = z
  .string()
  .trim()
  .min(1, 'Introduce tu email')
  .pipe(z.email('Introduce un email válido'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Introduce tu contraseña'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Introduce tu nombre'),
  email,
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
