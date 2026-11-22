import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export type CreateUrlData = {
  slug: string;
  fullUrl: string;
  userId: string;
  isAdmin: boolean;
};

export type UrlPersistResult = 'success' | 'collision' | 'error';

export async function createUrl(
  data: CreateUrlData,
): Promise<UrlPersistResult> {
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

export type FindUrlsByUserParams = {
  userId: string;
  query?: string;
};

function userUrlsWhere({ userId, query }: FindUrlsByUserParams) {
  if (!query) return { userId };
  return {
    userId,
    OR: [
      { slug: { contains: query, mode: 'insensitive' as const } },
      { fullUrl: { contains: query, mode: 'insensitive' as const } },
    ],
  };
}

export async function countUrlsByUser(params: FindUrlsByUserParams) {
  return prisma.url.count({ where: userUrlsWhere(params) });
}

export async function findUrlsByUser(
  params: FindUrlsByUserParams & { skip: number; take: number },
) {
  return prisma.url.findMany({
    where: userUrlsWhere(params),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    skip: params.skip,
    take: params.take,
    select: {
      id: true,
      slug: true,
      fullUrl: true,
      clicks: true,
      createdAt: true,
      isAdmin: true,
    },
  });
}

export type UpdateUrlData = {
  id: number;
  userId: string;
  slug: string;
  fullUrl: string;
};

export type UrlUpdateResult = UrlPersistResult | 'not_found';

export async function updateUrl({
  id,
  userId,
  slug,
  fullUrl,
}: UpdateUrlData): Promise<UrlUpdateResult> {
  try {
    const { count } = await prisma.url.updateMany({
      where: { id, userId },
      data: { slug, fullUrl },
    });
    return count === 0 ? 'not_found' : 'success';
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'collision';
    }
    console.error('Error updating URL:', error);
    return 'error';
  }
}

export async function deleteUrl(
  id: number,
  userId: string,
): Promise<'success' | 'not_found' | 'error'> {
  try {
    const { count } = await prisma.url.deleteMany({ where: { id, userId } });
    return count === 0 ? 'not_found' : 'success';
  } catch (error) {
    console.error('Error deleting URL:', error);
    return 'error';
  }
}
