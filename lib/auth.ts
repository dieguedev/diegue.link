import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: true,
      },
    },
  },
  trustedOrigins: 
    process.env.NODE_ENV === 'production'
      ? [process.env.PRODUCTION_URL] as string[]
      : ['http://localhost:3000', 'http://192.168.*.*:3000', 'http://127.0.0.1:3000'],
});
