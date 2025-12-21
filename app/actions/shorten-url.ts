'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

const SLUG_MAX_LENGTH = 50;
const SLUG_PATTERN = /^[a-zA-Z0-9-_]+$/;

function generateSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9-_]/g, '');
}

export async function shortenUrl(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: 'No autorizado. Por favor inicia sesión.' };
  }

  const url = formData.get('url') as string;
  let slug = formData.get('slug') as string;

  if (!url || url.trim() === '') {
    return { error: 'La URL es obligatoria' };
  }

  try {
    new URL(url);
  } catch (e) {
    return { error: 'La URL no es válida' };
  }

  if (slug) {
    slug = sanitizeSlug(slug.trim());

    if (slug.length === 0) {
      return { error: 'El alias no puede estar vacío' };
    }

    if (slug.length > SLUG_MAX_LENGTH) {
      return { error: `El alias no puede tener más de ${SLUG_MAX_LENGTH} caracteres` };
    }

    if (!SLUG_PATTERN.test(slug)) {
      return { error: 'El alias solo puede contener letras, números, guiones y guiones bajos' };
    }

    const existing = await prisma.url.findUnique({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug: slug,
        },
      },
    });

    if (existing) {
      return { error: 'Este alias ya existe' };
    }
  } else {
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
      slug = generateSlug();
      const existing = await prisma.url.findUnique({
        where: {
          userId_slug: {
            userId: session.user.id,
            slug: slug,
          },
        },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return { error: 'No se pudo generar un alias único. Por favor intenta de nuevo.' };
    }
  }

  try {
    const newUrl = await prisma.url.create({
      data: {
        fullUrl: url,
        slug: slug,
        userId: session.user.id,
      },
    });

    revalidatePath('/dashboard');
    
    const headersList = await headers();
    const host = headersList.get('host') || 'diegue.link';
    
    return { 
      success: true, 
      slug: newUrl.slug, 
      username: session.user.username,
      isAdmin: session.user.isAdmin || false,
      origin: host,
    };
  } catch (error) {
    console.error('Error creating URL:', error);
    return { error: 'Error al crear la URL corta. Por favor intenta de nuevo.' };
  }
}
