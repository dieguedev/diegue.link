import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';

export async function createUser({
  username,
  isAdmin = false,
}: {
  username: string;
  isAdmin?: boolean;
}) {
  return prisma.user.create({
    data: {
      id: randomUUID(),
      name: username,
      email: `${username}@example.com`,
      username,
      isAdmin,
    },
  });
}

export async function createLink(
  user: { id: string; isAdmin: boolean },
  { slug, fullUrl = `https://example.com/${slug}` }: { slug: string; fullUrl?: string },
) {
  return prisma.url.create({
    data: { slug, fullUrl, userId: user.id, isAdmin: user.isAdmin },
  });
}
