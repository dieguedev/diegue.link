'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { editLink, type MutationResult } from '@/domain/links/link-service';

const AUTH_ERROR = 'No autorizado. Por favor inicia sesión.';
const INVALID_ERROR = 'Enlace no válido.';

export type UpdateLinkResult = { status: 'idle' } | MutationResult;

export async function updateLink(formData: FormData): Promise<UpdateLinkResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { status: 'error', error: AUTH_ERROR };

  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) return { status: 'error', error: INVALID_ERROR };

  const result = await editLink({
    id,
    userId: session.user.id,
    rawUrl: formData.get('url')?.toString(),
    rawSlug: formData.get('slug')?.toString().trim(),
  });

  if (result.status === 'success') revalidatePath('/dashboard');
  return result;
}
