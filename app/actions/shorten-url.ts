'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { shorten, type ShortenResult } from '@/domain/services/url-service';

const AUTH_ERROR = 'No autorizado. Por favor inicia sesión.';

export type ShortenUrlResult = { status: 'idle' } | ShortenResult;

export async function shortenUrl(formData: FormData): Promise<ShortenUrlResult> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { status: 'error', error: AUTH_ERROR };

  const result = await shorten({
    rawUrl: formData.get('url')?.toString().trim(),
    rawSlug: formData.get('slug')?.toString().trim(),
    userId: session.user.id,
    isAdmin: !!session.user.isAdmin,
    username: session.user.username,
    host: headersList.get('host') || 'diegue.link',
  });

  if (result.status === 'success') revalidatePath('/dashboard');
  return result;
}
