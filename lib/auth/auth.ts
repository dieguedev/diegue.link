import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

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
      isAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  trustedOrigins: 
    process.env.NODE_ENV === 'production'
      ? [process.env.PRODUCTION_URL] as string[]
      : ['http://localhost:3000', 'http://192.168.*.*:3000', 'http://127.0.0.1:3000'],
});
