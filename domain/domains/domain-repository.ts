import { prisma } from '@/lib/prisma';

const DOMAIN_SELECT = {
  id: true,
  host: true,
  ownerId: true,
  verifiedAt: true,
} as const;

export async function findDomainByHost(host: string) {
  return prisma.domain.findUnique({
    where: { host },
    select: DOMAIN_SELECT,
  });
}

export async function findDomainById(id: number) {
  return prisma.domain.findUnique({
    where: { id },
    select: DOMAIN_SELECT,
  });
}

export async function findVerifiedDomainsOwnedBy(userId: string) {
  return prisma.domain.findMany({
    where: { ownerId: userId, verifiedAt: { not: null } },
    orderBy: { createdAt: 'asc' },
    select: DOMAIN_SELECT,
  });
}
