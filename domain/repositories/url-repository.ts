import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export type CreateUrlData = {
  slug: string;
  fullUrl: string;
  userId: string;
  isAdmin: boolean;
};

export type UrlPersistResult = 'success' | 'collision' | 'error';

export async function createUrl(data: CreateUrlData): Promise<UrlPersistResult> {
  try {
    await prisma.url.create({ data });
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

export async function findAdminUrl(slug: string) {
  return prisma.url.findFirst({
    where: { slug, isAdmin: true },
    select: { id: true, fullUrl: true },
  });
}

export async function findUserUrl(username: string, slug: string) {
  return prisma.url.findFirst({
    where: { slug, user: { username } },
    select: { id: true, fullUrl: true },
  });
}

export async function incrementClicks(id: number) {
  await prisma.url.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });
}
