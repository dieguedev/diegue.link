import { ArrowUpRight } from 'lucide-react';
import { GITHUB_REPO_URL } from '@/lib/site';

const LINK_CLASS = 'inline-flex min-h-11 items-center';

const LINKS = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Preguntas frecuentes', href: '#preguntas' },
  { label: 'GitHub', href: GITHUB_REPO_URL, external: true },
];

export function Footer() {
  return (
    <footer className="bg-secondary-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="flex flex-col gap-1">
            <span className="flex min-h-11 items-center text-xl font-bold">
              diegue.link
            </span>
            <p className="max-w-xs text-base">
              Acortador de enlaces gratuito y de código abierto.
            </p>
          </div>
          <nav aria-label="Pie de página">
            <ul className="flex flex-col md:flex-row md:gap-6">
              {LINKS.map(({ label, href, external }) => (
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
                        <span className="sr-only">
                          {' '}
                          (se abre en una pestaña nueva)
                        </span>
                      </>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="border-t-2 border-border pt-6 text-sm">
          © {new Date().getFullYear()} diegue.link
        </p>
      </div>
    </footer>
  );
}
