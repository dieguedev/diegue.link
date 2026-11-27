import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { LogIn, Star } from 'lucide-react';
import { shortNumberFormat } from '@/lib/utils/number-format';
import { getStargazers } from '@/domain/services/get-stargazers';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth/auth';
import { UserDropdown } from '@/features/auth/components/user-dropdown';
import { LocaleSwitcher } from '@/features/locale/components/locale-switcher';
import { GITHUB_REPO_URL, SITE_NAME } from '@/lib/site';

export async function Header() {
  const t = await getTranslations('Header');
  const starAmount = await getStargazers();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="sticky top-0 z-20">
      <Navbar>
        <div className="flex flex-1 self-stretch justify-between">
          <div className="flex items-center">
            <span className="text-center text-lg lg:text-xl font-bold p-2">
              {SITE_NAME}
            </span>
          </div>

          <div className="flex gap-3 items-center">
            <LocaleSwitcher />
            <Button
              link
              href={GITHUB_REPO_URL}
              variant="neutral"
              target="_blank"
              className="group"
            >
              {shortNumberFormat(starAmount)}{' '}
              <Star className="transition-[rotate,fill] duration-500 ease-ui group-hover:rotate-[72deg] group-hover:fill-main" />
            </Button>
            {!session ? (
              <AuthModal
                trigger={
                  <Button className="mr-4 md:mr-6">
                    {t('logIn')} <LogIn />
                  </Button>
                }
              />
            ) : (
              <UserDropdown username={session.user.username} />
            )}
          </div>
        </div>
      </Navbar>
    </header>
  );
}
