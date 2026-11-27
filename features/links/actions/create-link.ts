'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { shorten, type ShortenResult } from '@/domain/links/link-service';

export type CreateLinkResult =
  | { status: 'idle' }
  | ShortenResult
  | { status: 'error'; error: 'UNAUTHORIZED' };

export async function createLink(
  formData: FormData,
): Promise<CreateLinkResult> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { status: 'error', error: 'UNAUTHORIZED' };

  const result = await shorten({
    rawUrl: formData.get('url')?.toString(),
    rawSlug: formData.get('slug')?.toString().trim(),
    userId: session.user.id,
  });

  if (result.status === 'success') revalidatePath('/dashboard');
  return result;
}
