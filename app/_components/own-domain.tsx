import { ArrowDown, ChartColumn, Globe, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { SYSTEM_DOMAIN_HOST } from '@/lib/site';

const FRAGMENT_CLASS =
  'flex min-h-14 items-center rounded-base border-2 border-border bg-background px-3 py-2 font-mono text-sm';

const ALIAS_CLASS =
  'shrink-0 border-2 border-border bg-main px-1.5 py-0.5 font-bold';

const GENERATED_ALIAS = 'x7Kp2';

const POINTS = [
  { key: 'root', Icon: Globe },
  { key: 'yours', Icon: LockKeyhole },
  { key: 'panel', Icon: ChartColumn },
] as const;

export function OwnDomain() {
  const t = useTranslations('OwnDomain');

  return (
    <section
      id="dominio-propio"
      aria-labelledby="dominio-propio-title"
      className="border-b-2 border-border"
    >
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl content-center items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-base border-2 border-border bg-main px-3 py-1 text-sm font-bold uppercase tracking-wide">
            {t('badge')}
          </span>
          <h2
            id="dominio-propio-title"
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t.rich('title', {
              highlight: chunks => <HighlightedText>{chunks}</HighlightedText>,
            })}
          </h2>
          <p className="max-w-2xl text-base sm:text-xl">{t('intro')}</p>
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <Card
            aria-hidden="true"
            variant="secondary"
            className="gap-3 px-6 shadow-none"
          >
            <div className={FRAGMENT_CLASS}>
              <span className="truncate">{SYSTEM_DOMAIN_HOST}/</span>
              <span className={ALIAS_CLASS}>{GENERATED_ALIAS}</span>
            </div>
            <ArrowDown className="size-5 self-center" />
            <div className={FRAGMENT_CLASS}>
              <span className="truncate">{t('exampleDomain')}/</span>
              <span className={ALIAS_CLASS}>{t('exampleAlias')}</span>
            </div>
          </Card>

          <ul className="flex flex-col gap-6">
            {POINTS.map(({ key, Icon }) => (
              <li key={key} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-base border-2 border-border bg-main"
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold tracking-tight">
                    {t(`points.${key}.title`)}
                  </h3>
                  <p className="text-base">{t(`points.${key}.text`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
