import { Copy, Link as LinkIcon, MousePointerClick } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { SITE_NAME } from '@/lib/site';

const FRAGMENT_CLASS =
  'flex min-h-14 items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-3 py-2 font-mono text-sm';

const USERNAME = <span className="font-bold text-main">ana.</span>;

const STEPS = [
  {
    title: 'Pega el enlace largo',
    text: 'Un formulario, un artículo, un archivo en la nube... Cualquier cosa que quieras guardar o compartir!',
    fragment: (
      <div className={FRAGMENT_CLASS}>
        <LinkIcon className="size-4 shrink-0" />
        <span className="truncate">
          https://docs.google.com/forms/d/e/1FAIpQLSf9kXq2bR7vTzW/viewform?usp=sf_link
        </span>
      </div>
    ),
  },
  {
    title: 'Elige tu alias',
    text: 'Escribe la palabra que quieras al final o deja que generemos un identificador único por ti. Tu alias nunca estará pillado, cada uno es único por usuario.',
    fragment: (
      <div className={FRAGMENT_CLASS}>
        <span className="truncate">
          {USERNAME}
          {SITE_NAME}/
        </span>
        <span className="shrink-0 border-2 border-border bg-main px-1.5 py-0.5 font-bold">
          encuesta
        </span>
      </div>
    ),
  },
  {
    title: 'Comparte y observa los clics',
    text: 'Cópialo y pégalo donde quieras. En tu panel ves cuántas veces lo han abierto y puedes cambiar el destino en cualquier momento.',
    fragment: (
      <div className={`${FRAGMENT_CLASS} justify-between`}>
        <span className="truncate">
          {USERNAME}
          {SITE_NAME}/encuesta
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 items-center gap-1 border-2 border-border bg-secondary-background px-2 font-sans font-bold">
            <MousePointerClick className="size-4" />
            128
          </span>
          <span className="grid size-8 place-items-center border-2 border-border bg-main">
            <Copy className="size-4" />
          </span>
        </span>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="border-b-2 border-border bg-secondary-background"
    >
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center gap-12 px-4 py-20 md:gap-16">
        <div className="flex flex-col gap-4">
          <h2
            id="como-funciona-title"
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Un enlace corto en <HighlightedText>tres pasos</HighlightedText>
          </h2>
          <p className="max-w-2xl text-base sm:text-xl">
            Los enlaces largos son sospechosos, difíciles de leer y de recordar.
            Solo necesitas una cuenta gratuita y el enlace que quieras acortar!
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="min-w-0">
              <Card className="h-full gap-5 px-6 shadow-none">
                <span
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-base border-2 border-border bg-main font-heading text-xl"
                >
                  {i + 1}
                </span>
                <div aria-hidden="true">{step.fragment}</div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    <span className="sr-only">Paso {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="text-base">{step.text}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
