import { findUserUrl, incrementClicks } from '@/domain/repositories/url-repository';
import { redirect } from 'next/navigation';
import { after, NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const { username, slug } = await params;

  if (!username || !slug) {
    return new Response('Missing parameters', { status: 400 });
  }

  const url = await findUserUrl(username, slug);

  if (!url) {
    return new Response('URL not found', { status: 404 });
  }

  after(() => incrementClicks(url.id));

  return redirect(url.fullUrl);
}
