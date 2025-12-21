'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { randomBytes } from "crypto";

const CONFIG = {
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-zA-Z0-9-_]+$/,
  SLUG_LENGTH: 6,
  ALPHABET: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  DEFAULT_HOST: 'diegue.link'
};

const ERRORS = {
  AUTH: 'No autorizado. Por favor inicia sesión.',
  URL_REQ: 'La URL es obligatoria.',
  URL_INV: 'La URL no es válida.',
  SLUG_GEN: 'No se ha podido generar un alias único.',
  SLUG_EMPTY: 'El alias no puede estar vacío.',
  SLUG_LONG: `El alias no puede tener más de ${CONFIG.SLUG_MAX_LENGTH} caracteres.`,
  SLUG_CHARS: 'El alias sólo puede contener letras, números y guiones.',
  SLUG_EXISTS: 'Este alias ya existe.',
  GENERIC: 'Error al crear la URL corta. Intenta de nuevo.'
};

function generateSlug(length = CONFIG.SLUG_LENGTH): string {
  return Array.from(randomBytes(length))
    .map(byte => CONFIG.ALPHABET[byte % CONFIG.ALPHABET.length])
    .join('');
}

async function checkSlugExists(userId: string, slug: string) {
  return await prisma.url.findUnique({
    where: { userId_slug: { userId, slug } },
    select: { id: true }
  });
}

export async function shortenUrl(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: ERRORS.AUTH };

  const rawUrl = formData.get('url')?.toString().trim();
  const rawSlug = formData.get('slug')?.toString().trim();

  if (!rawUrl) return { error: ERRORS.URL_REQ };
  try { new URL(rawUrl); } catch { return { error: ERRORS.URL_INV }; }

  let slug = rawSlug;

  if (!slug) {
    let attempts = 0;
    while (attempts < 3) {
      const candidate = generateSlug();
      if (!(await checkSlugExists(session.user.id, candidate))) {
        slug = candidate;
        break;
      }
      attempts++;
    }
    if (!slug) return { error: ERRORS.SLUG_GEN };
  } else {
    if (slug.length > CONFIG.SLUG_MAX_LENGTH) return { error: ERRORS.SLUG_LONG };
    if (!CONFIG.SLUG_PATTERN.test(slug)) return { error: ERRORS.SLUG_CHARS };
    if (await checkSlugExists(session.user.id, slug)) return { error: ERRORS.SLUG_EXISTS };
  }

  try {
    const newUrl = await prisma.url.create({
      data: { fullUrl: rawUrl, slug, userId: session.user.id },
    });

    revalidatePath('/dashboard');
    const host = (await headers()).get('host') || CONFIG.DEFAULT_HOST;

    return { 
      success: true,
      slug: newUrl.slug,
      username: session.user.username,
      isAdmin: !!session.user.isAdmin,
      origin: host,
    };
  } catch (error) {
    console.error('Error creating URL:', error);
    return { error: ERRORS.GENERIC };
  }
}