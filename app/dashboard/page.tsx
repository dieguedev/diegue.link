import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateLinkForm } from '@/features/links/components/create-link-form';
import { LinksTable } from '@/features/links/components/links-table';
import { ClicksOverview } from '@/features/clicks/components/clicks-overview';

interface DashboardProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const { q, page } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  return (
    <div className="container mx-auto flex flex-col gap-12 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <ClicksOverview
          userId={session.user.id}
          username={session.user.username}
        />
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <CreateLinkForm />
        </Suspense>
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <LinksTable
          userId={session.user.id}
          username={session.user.username}
          query={q}
          page={page ? Number(page) : undefined}
        />
      </div>
    </div>
  );
}
