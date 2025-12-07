import { Button } from '@/components/ui/button';
import { HighlightedText } from '@/components/ui/highlightedText';
import Marquee from '@/components/ui/marquee';
import { Navbar } from '@/components/ui/navbar';
import StarWithStroke from '@/components/ui/starWithStroke';

import {
  Link,
  Star,
} from 'lucide-react';
import { shortNumberFormat } from '../lib/utils/numberFormat';
import { getStargazers } from '../domain/services/getStargazers';
import { AuthModal } from '@/components/ui/authModal';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { UserDropdown } from '@/components/ui/userDropdown';

const GITHUB_REPO_URL = 'https://github.com/dieguedev/diegue.link';

export default async function Home() {
  const starAmount = await getStargazers();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
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
      <main>
        <div className="flex flex-col gap-4 min-h-[75dvh] justify-center items-center bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] bg-[size:70px_70px] py-5">
          <div className="flex flex-col justify-center max-w-[66dvw]">
            <h1 className="text-center text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 p-2">
              Empieza a <HighlightedText>acortar</HighlightedText> los enlaces
              que <br className="hidden lg:block" />
              necesites guardar o compartir
            </h1>
            <p className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-3xl text-center mb-4 md:mb-6 p-2">
              ¿Quieres <span className="font-bold">compartir</span> un enlace
              pero es muy largo? ¿No quieres usar una aplicación de notas para{' '}
              <span className="font-bold">almacenarlo</span>?
            </p>
            <div className="flex justify-center">
              <Button size="hero">
                <div className="flex flex-row justify-center items-center gap-2">
                  <p className="text-lg sm:text-lg md:text-xl lg:text-xl xl:text-xl 2xl:text-2xl">
                    Acortar
                  </p>
                  <Link />
                </div>
              </Button>
            </div>
          </div>
        </div>
        <Marquee
          items={[
            'Acorta tus enlaces',
            <StarWithStroke starNumber={16} size={40} />,
            'Compártelos',
            <StarWithStroke starNumber={27} size={40} />,
            'Guárdalos',
            <StarWithStroke starNumber={16} size={40} />,
            'Acorta tus enlaces',
            <StarWithStroke starNumber={27} size={40} />,
            'Compártelos',
            <StarWithStroke starNumber={16} size={40} />,
            'Guárdalos',
            <StarWithStroke starNumber={27} size={40} />,
            'Acorta tus enlaces',
            <StarWithStroke starNumber={27} size={40} />,
            'Compártelos',
            <StarWithStroke starNumber={16} size={40} />,
            'Guárdalos',
            <StarWithStroke starNumber={27} size={40} />,
            'Acorta tus enlaces',
            <StarWithStroke starNumber={27} size={40} />,
            'Compártelos',
            <StarWithStroke starNumber={16} size={40} />,
            'Guárdalos',
            <StarWithStroke starNumber={27} size={40} />,
          ]}
        />
      </main>
    </>
  );
}
