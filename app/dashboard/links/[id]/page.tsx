import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { LinkStats } from '@/features/clicks/components/link-stats';

interface LinkStatsPageProps {
  params: Promise<{ id: string }>;
}

export default async function LinkStatsPage({ params }: LinkStatsPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  const linkId = Number(id);
  if (!Number.isInteger(linkId) || linkId <= 0) notFound();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <LinkStats
        id={linkId}
        userId={session.user.id}
        username={session.user.username}
      />
    </div>
  );
}
