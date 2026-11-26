import { prisma } from '@/lib/prisma';

const DOMAIN_SELECT = { id: true, host: true } as const;

export async function findDomainByHost(host: string) {
  return prisma.domain.findUnique({
    where: { host },
    select: DOMAIN_SELECT,
  });
}

export async function findVerifiedDomainOwnedBy(userId: string) {
  return prisma.domain.findFirst({
    where: { ownerId: userId, verifiedAt: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: DOMAIN_SELECT,
  });
}
