import { prisma } from '@/lib/prisma';

const DOMAIN_SELECT = { id: true, host: true } as const;

export async function findDomainByHost(host: string) {
  return prisma.domain.findUnique({
    where: { host },
    select: DOMAIN_SELECT,
  });
}
