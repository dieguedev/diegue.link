import { afterEach, describe, expect, it, vi } from 'vitest';
import { routeRequest } from '@/lib/routing/route-request';

const SITE = { type: 'site' };

function routesOf(host: string, pathnames: string[]) {
  return pathnames.map(pathname => routeRequest({ host, pathname }));
}

describe('En el enrutado por host', () => {
  describe('el sitio', () => {
    it('muestra la landing', () => {
      expect(routeRequest({ host: 'trim.cat', pathname: '/' })).toEqual(SITE);
    });

    it('muestra el dashboard', () => {
      expect(
        routesOf('trim.cat', ['/dashboard', '/dashboard/links/3']),
      ).toEqual([SITE, SITE]);
    });

    it('atiende la autenticación', () => {
      expect(
        routeRequest({ host: 'trim.cat', pathname: '/api/auth/session' }),
      ).toEqual(SITE);
    });

    it('sirve sus ficheros', () => {
      expect(
        routeRequest({ host: 'trim.cat', pathname: '/og-image.jpg' }),
      ).toEqual(SITE);
    });

    it('busca cualquier otra ruta como alias de trim.cat', () => {
      expect(routesOf('trim.cat', ['/x7Kp2a', '/u/ana/cv'])).toEqual([
        { type: 'link', domain: 'trim.cat', path: '/x7Kp2a' },
        { type: 'link', domain: 'trim.cat', path: '/u/ana/cv' },
      ]);
    });
  });

  describe('un dominio propio', () => {
    it('lleva la raíz al sitio', () => {
      expect(routeRequest({ host: 'diegue.link', pathname: '/' })).toEqual({
        type: 'redirect',
        to: 'https://trim.cat',
        permanent: false,
      });
    });

    it('busca la ruta completa como alias', () => {
      expect(routesOf('diegue.link', ['/charla', '/u/ana/cv'])).toEqual([
        { type: 'link', domain: 'diegue.link', path: '/charla' },
        { type: 'link', domain: 'diegue.link', path: '/u/ana/cv' },
      ]);
    });

    it('busca el dashboard como un alias', () => {
      expect(
        routeRequest({ host: 'diegue.link', pathname: '/dashboard' }),
      ).toEqual({ type: 'link', domain: 'diegue.link', path: '/dashboard' });
    });

    it('busca la autenticación como un alias', () => {
      expect(
        routeRequest({ host: 'diegue.link', pathname: '/api/auth/session' }),
      ).toEqual({
        type: 'link',
        domain: 'diegue.link',
        path: '/api/auth/session',
      });
    });

    it('no sirve los ficheros del sitio', () => {
      expect(
        routeRequest({ host: 'diegue.link', pathname: '/og-image.jpg' }),
      ).toEqual({ type: 'link', domain: 'diegue.link', path: '/og-image.jpg' });
    });
  });

  describe('un host con www', () => {
    it('lleva al host sin www', () => {
      expect(
        routeRequest({ host: 'www.trim.cat', pathname: '/x7Kp2a' }),
      ).toEqual({
        type: 'redirect',
        to: 'https://trim.cat/x7Kp2a',
        permanent: true,
      });
    });
  });

  describe('un host de la red local', () => {
    const LOCAL_HOSTS = [
      'localhost:3000',
      '127.0.0.1:3000',
      '192.168.50.212:3000',
    ];

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('muestra el sitio en desarrollo', () => {
      vi.stubEnv('NODE_ENV', 'development');

      for (const host of LOCAL_HOSTS) {
        expect(routesOf(host, ['/', '/dashboard'])).toEqual([SITE, SITE]);
      }
    });

    it('busca sus alias en trim.cat en desarrollo', () => {
      vi.stubEnv('NODE_ENV', 'development');

      expect(
        routeRequest({ host: '192.168.50.212:3000', pathname: '/x7Kp2a' }),
      ).toEqual({ type: 'link', domain: 'trim.cat', path: '/x7Kp2a' });
    });

    it('se busca como cualquier dominio fuera de desarrollo', () => {
      vi.stubEnv('NODE_ENV', 'production');

      expect(
        routeRequest({ host: '192.168.50.212:3000', pathname: '/dashboard' }),
      ).toEqual({
        type: 'link',
        domain: '192.168.50.212:3000',
        path: '/dashboard',
      });
    });
  });

  describe('un host desconocido', () => {
    it('se busca como cualquier dominio', () => {
      expect(routeRequest({ host: 'otro.com', pathname: '/algo' })).toEqual({
        type: 'link',
        domain: 'otro.com',
        path: '/algo',
      });
    });
  });
});
