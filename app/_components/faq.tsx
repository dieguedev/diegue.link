import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { GITHUB_REPO_URL } from '@/lib/site';

const LINK_CLASS = 'font-heading link-underline';

const QUESTIONS = [
  {
    question: '¿Cuánto cuesta?',
    answer:
      'Nada. Crear una cuenta, acortar enlaces y consultar sus clics es gratis.',
  },
  {
    question: '¿Necesito una cuenta?',
    answer:
      'Sí. Con ella tus enlaces quedan guardados en tu panel y solo tú puedes editarlos o borrarlos. Te registras con tu correo en unos segundos.',
  },
  {
    question: '¿Caducan los enlaces?',
    answer: 'No. Un enlace funciona hasta que tú lo borras desde el panel.',
  },
  {
    question: '¿Puedo cambiar adónde lleva un enlace?',
    answer:
      'Sí. Desde el panel editas el destino y el alias cuando quieras. Si cambias el alias, la URL corta anterior deja de funcionar.',
  },
  {
    question: '¿Qué caracteres admite un alias?',
    answer:
      'Letras sin tilde, números, guiones y guiones bajos, hasta 50 caracteres. Cada usuario tiene su propia dirección, como ana.diegue.link, así que tu alias no choca con el de nadie.',
  },
  {
    question: '¿Cómo se cuentan los clics?',
    answer:
      'Cada visita a tu enlace suma un clic. El total aparece en tu panel, junto a cada enlace.',
  },
];

export function Faq() {
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="border-b-2 border-border"
    >
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl content-center gap-10 px-4 py-20 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2
            id="preguntas-title"
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Preguntas <HighlightedText>frecuentes</HighlightedText>
          </h2>
          <p className="text-base sm:text-xl">
            ¿No encuentras la tuya? Abre una issue en{' '}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              GitHub
            </a>{' '}
            y te respondemos ahí.
          </p>
        </div>

        <Accordion className="flex flex-col gap-4">
          {QUESTIONS.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent className="text-base">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
