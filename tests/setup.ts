import { afterAll, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Click", "Url", "Session", "Account", "User" RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
