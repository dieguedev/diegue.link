'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { shorten, type ShortenResult } from '@/domain/links/link-service';
import { SITE_HOST } from '@/lib/site';

const AUTH_ERROR = 'No autorizado. Por favor inicia sesión.';

export type CreateLinkResult = { status: 'idle' } | ShortenResult;

export async function createLink(formData: FormData): Promise<CreateLinkResult> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { status: 'error', error: AUTH_ERROR };

  const result = await shorten({
    rawUrl: formData.get('url')?.toString().trim(),
    rawSlug: formData.get('slug')?.toString().trim(),
    userId: session.user.id,
    isAdmin: !!session.user.isAdmin,
    username: session.user.username,
    host: SITE_HOST,
  });

  if (result.status === 'success') revalidatePath('/dashboard');
  return result;
}
