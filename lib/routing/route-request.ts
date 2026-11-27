import { SITE_HOST, SITE_ORIGIN, SYSTEM_DOMAIN_HOST } from '@/lib/site';

const WWW = 'www.';
const SITE_PATHS = ['/dashboard', '/api/auth'];
const ASSET = /\/[^/]+\.[a-z\d]+$/i;

export type Route =
  | { type: 'site' }
  | { type: 'redirect'; to: string; permanent: boolean }
  | { type: 'link'; domain: string; path: string };

function isSitePath(pathname: string): boolean {
  if (pathname === '/' || ASSET.test(pathname)) return true;
  return SITE_PATHS.some(
    path => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function routeRequest({
  host,
  pathname,
}: {
  host: string;
  pathname: string;
}): Route {
  if (host.startsWith(WWW))
    return {
      type: 'redirect',
      to: `https://${host.slice(WWW.length)}${pathname}`,
      permanent: true,
    };

  if (host === SITE_HOST)
    return isSitePath(pathname)
      ? { type: 'site' }
      : { type: 'link', domain: SYSTEM_DOMAIN_HOST, path: pathname };

  if (pathname === '/')
    return { type: 'redirect', to: SITE_ORIGIN, permanent: false };

  return { type: 'link', domain: host, path: pathname };
}
