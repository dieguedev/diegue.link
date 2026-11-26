import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

const ADDRESS_SELECT = {
  slug: true,
  isAdmin: true,
  user: { select: { username: true } },
} as const;

const LINK_SELECT = {
  ...ADDRESS_SELECT,
  id: true,
  fullUrl: true,
  clicks: true,
  createdAt: true,
} as const;

export type CreateUrlData = {
  slug: string;
  fullUrl: string;
  userId: string;
  isAdmin: boolean;
  domainId?: number;
};

export type UrlPersistResult = 'success' | 'collision' | 'error';

export async function findUserIsAdmin(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return user.isAdmin;
}

export async function createUrl(data: CreateUrlData) {
  try {
    return await prisma.url.create({ data, select: LINK_SELECT });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'collision' as const;
    }
    console.error('Error creating URL:', error);
    return 'error' as const;
  }
}

export async function findUrlByAddress({
  slug,
  username,
}: {
  slug: string;
  username?: string;
}) {
  return prisma.url.findFirst({
    where: username ? { slug, user: { username } } : { slug, isAdmin: true },
    select: { id: true, fullUrl: true },
  });
}

export async function findUrlByIdForUser(id: number, userId: string) {
  return prisma.url.findFirst({
    where: { id, userId },
    select: LINK_SELECT,
  });
}

export async function findUrlsByIds(ids: number[], userId: string) {
  return prisma.url.findMany({
    where: { id: { in: ids }, userId },
    select: LINK_SELECT,
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
    select: LINK_SELECT,
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
