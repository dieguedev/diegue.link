import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { HighlightedText } from '@/components/ui/highlightedText';
import { Input } from '@/components/ui/input';
import Marquee from '@/components/ui/marquee';
import { Navbar } from '@/components/ui/navbar';
import StarWithStroke from '@/components/ui/starWithStroke';

import { Github } from 'lucide-react';

export default function Home() {
  return (
    <>
      <header>
        <Navbar>
          <Button variant="neutral" size="icon">
            <Github />
          </Button>
        </Navbar>
      </header>
      <main>
        <div className="flex flex-col gap-4 h-[85dvh] justify-center items-center bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] bg-[size:70px_70px]">
          <div className="flex flex-col justify-center max-w-[66dvw]">
            <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 p-2">
              Empieza a <HighlightedText>acortar</HighlightedText> los enlaces
              que <br className="hidden lg:block" />
              necesites guardar o compartir
            </h1>
            <p className="text-center mb-4 md:mb-6 p-2">
              ¿Has encontrado un enlace que quieres{' '}
              <span className="font-bold">compartir</span> pero no quieres usar
              el enlace original porque es muy largo? ¿Quizás no quieres usar
              simplemente una aplicación de notas para{' '}
              <span className="font-bold">almacenarlo</span>?
            </p>
            <div className="flex justify-center">
              <Button>Acortar</Button>
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
          ]}
        />
      </main>
    </>
  );
}
