import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { GITHUB_REPO_URL, SITE_NAME } from '@/lib/site';

const LINK_CLASS = 'font-heading link-underline';

const QUESTION_KEYS = [
  'cost',
  'account',
  'expiry',
  'destination',
  'alias',
  'clicks',
] as const;

export function Faq() {
  const t = useTranslations('Faq');

  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="border-b-2 border-border bg-secondary-background"
    >
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl content-center gap-10 px-4 py-20 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2
            id="preguntas-title"
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t.rich('title', {
              highlight: chunks => <HighlightedText>{chunks}</HighlightedText>,
            })}
          </h2>
          <p className="text-base sm:text-xl">
            {t.rich('intro', {
              github: chunks => (
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK_CLASS}
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>

        <Accordion className="flex flex-col gap-4">
          {QUESTION_KEYS.map(key => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger>
                {t(`questions.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {t(`questions.${key}.answer`, { site: SITE_NAME })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
