import { resolveLink } from '@/domain/links/link-service';
import { recordClick } from '@/domain/repositories/click-repository';
import { getClickMetadata } from '@/lib/analytics/click-metadata';
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

  const url = await resolveLink({ username, slug });

  if (!url) {
    return new Response('URL not found', { status: 404 });
  }

  // Los headers se leen ahora: dentro de `after()` el request ya no está disponible
  const metadata = getClickMetadata(request);
  after(() => recordClick(url.id, metadata));

  return redirect(url.fullUrl);
}
