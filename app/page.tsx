import { HighlightedText } from '@/components/ui/highlighted-text';
import { HeroCta } from '@/app/_components/hero-cta';
import Marquee from '@/components/ui/marquee';
import StarWithStroke from '@/components/ui/star-with-stroke';

const MARQUEE_PHRASES = ['Acorta tus enlaces', 'Compártelos', 'Guárdalos'];

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
        className={
          isRound ? `motion-safe:animate-star-spin ${spin}` : undefined
        }
      />,
    ];
  }),
);

export default function Home() {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] flex-col">
      <div className="flex flex-1 flex-col gap-4 justify-center items-center bg-[linear-gradient(to_right,#8080804D_1px,transparent_1px),linear-gradient(to_bottom,#80808090_1px,transparent_1px)] bg-[size:70px_70px] py-8 max-sm:short:py-3 sm:py-12">
        <div className="flex flex-col justify-center w-full max-w-6xl px-4">
          <h1 className="text-center text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.1] tracking-tight mb-4 max-sm:short:mb-2 max-sm:short:text-4xl md:mb-8 p-2">
            Empieza a <HighlightedText>acortar</HighlightedText>
            <br />
            tus enlaces
          </h1>
          <p className="max-w-3xl mx-auto text-base max-sm:short:text-sm sm:text-xl md:text-2xl text-center mb-4 max-sm:short:mb-3 md:mb-6 p-2">
            Convierte cualquier enlace largo en{' '}
            <span className="font-bold">uno corto</span> y fácil de compartir.
            Además, tenlos todos a mano{' '}
            <span className="font-bold">en un solo sitio</span>, sin notas ni
            marcadores.
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
