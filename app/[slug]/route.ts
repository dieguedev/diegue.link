import { findAdminUrl } from '@/domain/repositories/url-repository';
import { recordClick } from '@/domain/repositories/click-repository';
import { getClickMetadata } from '@/lib/analytics/click-metadata';
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

  const url = await findAdminUrl(slug);

  if (!url) {
    return new Response('Not found', { status: 404 });
  }

  // Los headers se leen ahora: dentro de `after()` el request ya no está disponible
  const metadata = getClickMetadata(request);
  after(() => recordClick(url.id, metadata));

  return redirect(url.fullUrl);
}
