export const SITE_NAME = 'diegue.link';
export const SITE_HOST = process.env.SITE_HOST ?? 'localhost:3000';
export const SITE_ORIGIN = `${process.env.SITE_HOST ? 'https' : 'http'}://${SITE_HOST}`;

export const GITHUB_OWNER = 'dieguedev';
export const GITHUB_REPO = 'diegue.link';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;

export const PRIMARY_DOMAIN_HOST = 'diegue.link';
export const SYSTEM_DOMAIN_HOST = 'trim.cat';

export function domainHostOf(requestHost: string) {
  return requestHost === SITE_HOST ? PRIMARY_DOMAIN_HOST : requestHost;
}

export function publicHostOf(domainHost: string) {
  return domainHost === SYSTEM_DOMAIN_HOST ? SITE_HOST : domainHost;
}
