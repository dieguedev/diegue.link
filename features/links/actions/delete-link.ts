'use server';

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { removeLink, type MutationResult } from '@/domain/links/link-service';

export type DeleteLinkResult =
  | MutationResult
  | { status: 'error'; error: 'UNAUTHORIZED' | 'INVALID_LINK' };

export async function deleteLink(id: number): Promise<DeleteLinkResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { status: 'error', error: 'UNAUTHORIZED' };
  if (!Number.isInteger(id)) return { status: 'error', error: 'INVALID_LINK' };

  const result = await removeLink(id, session.user.id);
  if (result.status === 'success') revalidatePath('/dashboard');
  return result;
}
