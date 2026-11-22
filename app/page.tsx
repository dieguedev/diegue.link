import { HighlightedText } from '@/components/ui/highlighted-text';
import { HeroCta } from '@/app/_components/hero-cta';
import Marquee from '@/components/ui/marquee';
import StarWithStroke from '@/components/ui/star-with-stroke';

const MARQUEE_PHRASES = ['Acorta tus enlaces', 'Compártelos', 'Guárdalos'];

// Solo gira la estrella redonda (16), alternando sentido; la estrecha (27) se queda quieta.
const MARQUEE_ITEMS = Array.from({ length: 4 }).flatMap((_, round) =>
  MARQUEE_PHRASES.flatMap((phrase, i) => {
    const n = round * MARQUEE_PHRASES.length + i;
    const isRound = n % 2 === 0;
    const spin = n % 4 === 0 ? '' : '[animation-direction:reverse]';
    return [
      phrase,
      <StarWithStroke
        key={`star-${n}`}
        starNumber={isRound ? 16 : 27}
        size={40}
        aria-hidden
        className={isRound ? `motion-safe:animate-star-spin ${spin}` : undefined}
      />,
    ];
  }),
);

export default function Home() {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-col">
      <div className="flex flex-1 flex-col gap-4 justify-center items-center bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] bg-[size:70px_70px] py-16 md:py-24 lg:py-32">
        <div className="flex flex-col justify-center w-full max-w-6xl px-4">
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight mb-4 md:mb-6 p-2">
            Empieza a <HighlightedText>acortar</HighlightedText> los enlaces que{' '}
            <br className="hidden lg:block" />
            necesites guardar o compartir
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl md:text-2xl text-center mb-4 md:mb-6 p-2">
            Convierte cualquier enlace largo en{' '}
            <span className="font-bold">uno corto</span> y fácil de compartir. Y
            tenlos todos a mano <span className="font-bold">en un solo sitio</span>,
            sin notas ni marcadores.
          </p>
          <div className="flex justify-center">
            <HeroCta />
          </div>
        </div>
      </div>
      <Marquee items={MARQUEE_ITEMS} />
    </main>
  );
}
