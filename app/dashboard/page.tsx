import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UrlForm } from './url-form';

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/');

  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <UrlForm />
      </Suspense>
    </div>
  );
}
