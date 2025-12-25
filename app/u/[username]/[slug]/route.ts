import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { after, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const { username, slug } = await params;

  if (!username || !slug) {
    return new Response('Missing parameters', { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  const url = await prisma.url.findUnique({
    where: {
      userId_slug: {
        userId: user.id,
        slug: slug,
      },
    },
  });

  if (!url) {
    return new Response('URL not found', { status: 404 });
  }

  after(async () => {
    await prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    });
  });

  return redirect(url.fullUrl);
}
