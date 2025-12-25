import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { NextRequest, after } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const url = await prisma.url.findFirst({
    where: {
      slug: slug,
      isAdmin: true,
    },
    select: {
      id: true,
      fullUrl: true,
    }
  });

  if (!url) {
    return new Response('Not found', { status: 404 });
  }

  after(async () => {
    await prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    });
  });

  return redirect(url.fullUrl);
}
