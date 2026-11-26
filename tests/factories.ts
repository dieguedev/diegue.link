import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';

export async function createUser({ username }: { username: string }) {
  return prisma.user.create({
    data: {
      id: randomUUID(),
      name: username,
      email: `${username}@example.com`,
      username,
    },
  });
}

export async function createDomain({
  host = 'diegue.link',
  owner,
  verified = true,
}: {
  host?: string;
  owner?: { id: string };
  verified?: boolean;
} = {}) {
  return prisma.domain.create({
    data: {
      host,
      ownerId: owner?.id,
      verifiedAt: verified ? new Date() : null,
    },
  });
}

export async function createLink(
  user: { id: string },
  domain: { id: number },
  {
    slug,
    fullUrl = `https://example.com/${slug}`,
  }: { slug: string; fullUrl?: string },
) {
  return prisma.url.create({
    data: {
      slug,
      fullUrl,
      userId: user.id,
      domainId: domain.id,
    },
  });
}
