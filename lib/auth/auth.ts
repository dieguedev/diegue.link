import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';
import { SITE_ORIGIN } from '@/lib/site';

const DEV_EXTRA_ORIGINS = ['http://127.0.0.1:3000', 'http://192.168.*.*:3000'];

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
      ? [SITE_ORIGIN]
      : [SITE_ORIGIN, ...DEV_EXTRA_ORIGINS],
});
