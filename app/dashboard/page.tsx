import { Suspense } from 'react';
import { UrlForm } from './url-form';

export default async function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <UrlForm />
      </Suspense>
    </div>
  );
}