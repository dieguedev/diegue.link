'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';

const CONFIG = {
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-zA-Z0-9-_]+$/,
  SLUG_LENGTH: 6,
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  DEFAULT_HOST: 'diegue.link',
};

const ERRORS = {
  AUTH: 'No autorizado. Por favor inicia sesión.',
  URL_REQ: 'La URL es obligatoria.',
  URL_INV: 'La URL no es válida.',
  SLUG_GEN: 'No se ha podido generar un alias único.',
  SLUG_LONG: `El alias no puede tener más de ${CONFIG.SLUG_MAX_LENGTH} caracteres.`,
  SLUG_CHARS: 'El alias sólo puede contener letras, números y guiones.',
  SLUG_EXISTS: 'Este alias ya existe.',
  GENERIC: 'Error al crear la URL corta. Intenta de nuevo.',
};

function generateSlug(length = CONFIG.SLUG_LENGTH): string {
  return Array.from(randomBytes(length))
    .map(byte => CONFIG.ALPHABET[byte % CONFIG.ALPHABET.length])
    .join('');
}

function validateSlug(slug: string): string | null {
  if (slug.length > CONFIG.SLUG_MAX_LENGTH) return ERRORS.SLUG_LONG;
  if (!CONFIG.SLUG_PATTERN.test(slug)) return ERRORS.SLUG_CHARS;
  return null;
}

function buildShortUrl(
  slug: string,
  isAdmin: boolean,
  username: string,
  host: string,
): string {
  return isAdmin ? `${host}/${slug}` : `${host}/u/${username}/${slug}`;
}

async function persistUrl(
  slug: string,
  fullUrl: string,
  userId: string,
  isAdmin: boolean,
): Promise<'success' | 'collision' | 'error'> {
  try {
    await prisma.url.create({ data: { fullUrl, slug, userId, isAdmin } });
    return 'success';
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'collision';
    }
    console.error('Error creating URL:', error);
    return 'error';
  }
}

export type ShortenUrlResult =
  | { status: 'idle' }
  | { status: 'success'; shortUrl: string }
  | { status: 'error'; error: string };

export async function shortenUrl(
  formData: FormData,
): Promise<ShortenUrlResult> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { status: 'error', error: ERRORS.AUTH };

  const rawUrl = formData.get('url')?.toString().trim();
  const rawSlug = formData.get('slug')?.toString().trim();

  if (!rawUrl) return { status: 'error', error: ERRORS.URL_REQ };
  try {
    new URL(rawUrl);
  } catch {
    return { status: 'error', error: ERRORS.URL_INV };
  }

  const isAdmin = !!session.user.isAdmin;
  const host = headersList.get('host') || CONFIG.DEFAULT_HOST;

  if (rawSlug) {
    const validationError = validateSlug(rawSlug);
    if (validationError) return { status: 'error', error: validationError };

    const result = await persistUrl(rawSlug, rawUrl, session.user.id, isAdmin);
    if (result === 'collision')
      return { status: 'error', error: ERRORS.SLUG_EXISTS };
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };

    revalidatePath('/dashboard');
    return {
      status: 'success',
      shortUrl: buildShortUrl(rawSlug, isAdmin, session.user.username, host),
    };
  }

  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug();
    const result = await persistUrl(slug, rawUrl, session.user.id, isAdmin);
    if (result === 'success') {
      revalidatePath('/dashboard');
      return {
        status: 'success',
        shortUrl: buildShortUrl(slug, isAdmin, session.user.username, host),
      };
    }
    if (result === 'error') return { status: 'error', error: ERRORS.GENERIC };
  }

  return { status: 'error', error: ERRORS.SLUG_GEN };
}
