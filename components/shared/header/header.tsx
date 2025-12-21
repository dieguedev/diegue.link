import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { Star } from 'lucide-react';
import { shortNumberFormat } from '@/lib/utils/number-format';
import { getStargazers } from '@/domain/services/get-stargazers';
import { AuthModal } from '@/components/shared/auth-modal/auth-modal';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { UserDropdown } from '@/components/shared/user-dropdown/user-dropdown';

const GITHUB_REPO_URL = 'https://github.com/dieguedev/diegue.link';

export async function Header() {
  const starAmount = await getStargazers();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-20">
      <Navbar>
        <div className="flex flex-1 justify-between">
          <div className="flex items-center">
            <span className="text-center text-lg lg:text-xl font-bold p-2">
              diegue.link
            </span>
          </div>

          <div className="flex gap-3 items-center">
            <Button
              link
              href={GITHUB_REPO_URL}
              variant="neutral"
              target="_blank"
            >
              {shortNumberFormat(starAmount)} <Star />
            </Button>
            {!session ? (
              <AuthModal />
            ) : (
              <UserDropdown username={session.user.username} />
            )}
          </div>
        </div>
      </Navbar>
    </header>
  );
}
