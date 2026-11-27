import { resolveLink } from '@/domain/links/link-service';
import { recordClick } from '@/domain/repositories/click-repository';
import { getClickMetadata } from '@/lib/analytics/click-metadata';
import { redirect } from 'next/navigation';
import { NextRequest, after } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string; path: string[] }> },
) {
  const { domain, path } = await params;

  const url = await resolveLink({ domain, slug: path.join('/') });

  if (!url) {
    return new Response('Not found', { status: 404 });
  }

  const metadata = getClickMetadata(request);
  after(() => recordClick(url.id, metadata));

  return redirect(url.fullUrl);
}
