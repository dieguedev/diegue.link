import { linkDomainsFor } from '@/domain/links/link-service';
import { CreateLinkForm } from '@/features/links/components/create-link-form';

export async function CreateLink({ userId }: { userId: string }) {
  const domains = await linkDomainsFor(userId);
  return <CreateLinkForm domains={domains} />;
}
