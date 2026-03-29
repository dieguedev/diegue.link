import { findAdminUrl, incrementClicks } from '@/domain/repositories/url-repository';
import { redirect } from 'next/navigation';
import { NextRequest, after } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const url = await findAdminUrl(slug);

  if (!url) {
    return new Response('Not found', { status: 404 });
  }

  after(() => incrementClicks(url.id));

  return redirect(url.fullUrl);
}
