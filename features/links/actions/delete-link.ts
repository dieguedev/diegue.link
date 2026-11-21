'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { removeLink, type MutationResult } from '@/domain/services/url-service';

const AUTH_ERROR = 'No autorizado. Por favor inicia sesión.';
const INVALID_ERROR = 'Enlace no válido.';

export async function deleteLink(id: number): Promise<MutationResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { status: 'error', error: AUTH_ERROR };
  if (!Number.isInteger(id)) return { status: 'error', error: INVALID_ERROR };

  const result = await removeLink(id, session.user.id);
  if (result.status === 'success') revalidatePath('/dashboard');
  return result;
}
