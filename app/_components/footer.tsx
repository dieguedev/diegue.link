import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GITHUB_REPO_URL, SITE_NAME } from '@/lib/site';

const LINK_CLASS = 'inline-flex min-h-11 items-center';

export function Footer() {
  const t = useTranslations('Footer');
  const links = [
    { label: t('howItWorks'), href: '#como-funciona' },
    { label: t('faq'), href: '#preguntas' },
    { label: 'GitHub', href: GITHUB_REPO_URL, external: true },
  ];

  return (
    <footer className="bg-secondary-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="flex flex-col gap-1">
            <span className="flex min-h-11 items-center text-xl font-bold">
              {SITE_NAME}
            </span>
            <p className="max-w-xs text-base">{t('tagline')}</p>
          </div>
          <nav aria-label={t('navLabel')}>
            <ul className="flex flex-col md:flex-row md:gap-6">
              {links.map(({ label, href, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={LINK_CLASS}
                    {...(external && {
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    })}
                  >
                    <span className="link-underline">{label}</span>
                    {external && (
                      <>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="ml-1 size-4 shrink-0"
                        />
                        <span className="sr-only"> {t('newTab')}</span>
                      </>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="border-t-2 border-border pt-6 text-sm">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
