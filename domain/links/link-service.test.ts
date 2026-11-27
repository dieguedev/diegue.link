import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { recordClick } from '@/domain/repositories/click-repository';
import {
  getClicksOverview,
  getLinkStats,
} from '@/domain/services/stats-service';
import type { ClickMetadata } from '@/lib/analytics/click-metadata';
import {
  editLink,
  listLinks,
  removeLink,
  resolveLink,
  shorten,
} from '@/domain/links/link-service';
import { createDomain, createLink, createUser } from '@/tests/factories';

const VISIT: ClickMetadata = {
  isBot: false,
  device: 'desktop',
  browser: 'Chrome',
  os: 'macOS',
  referrer: null,
  country: 'ES',
  city: 'Madrid',
};

type User = Awaited<ReturnType<typeof createUser>>;
type Domain = Awaited<ReturnType<typeof createDomain>>;

async function addressesOf(user: User) {
  const { links } = await listLinks({ userId: user.id });
  return links.map(link => link.address);
}

async function totalClicks(user: User, id: number) {
  const { links } = await listLinks({ userId: user.id });
  return links.find(link => link.id === id)?.clicks;
}

describe('En link service', () => {
  let diegue: User;
  let ana: User;
  let diegueLink: Domain;

  beforeEach(async () => {
    diegue = await createUser({ username: 'diegue' });
    ana = await createUser({ username: 'ana' });
    diegueLink = await createDomain({ host: 'diegue.link', owner: diegue });
  });

  describe('la dirección de un enlace', () => {
    it('se devuelve al crearlo', async () => {
      const result = await shorten({
        rawUrl: 'https://ana.dev/portfolio',
        rawSlug: 'portfolio',
        userId: ana.id,
      });

      expect(result).toMatchObject({
        status: 'success',
        link: { slug: 'portfolio', address: 'diegue.link/u/ana/portfolio' },
      });
      expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/portfolio']);
    });

    it('cuelga de la raíz si el usuario es dueño del dominio', async () => {
      const result = await shorten({
        rawUrl: 'https://charlas.example.com/charla',
        rawSlug: 'charla',
        userId: diegue.id,
      });

      expect(result).toMatchObject({
        status: 'success',
        link: { slug: 'charla', address: 'diegue.link/charla' },
      });
    });

    it('lleva el nombre de su usuario si no lo es', async () => {
      const result = await shorten({
        rawUrl: 'https://ana.dev/blog',
        rawSlug: 'blog',
        userId: ana.id,
      });

      expect(result).toMatchObject({
        status: 'success',
        link: { slug: 'blog', address: 'diegue.link/u/ana/blog' },
      });
    });

    it('lleva el nombre de su usuario si su dominio no está verificado', async () => {
      await createDomain({ host: 'ana.dev', owner: ana, verified: false });

      const result = await shorten({
        rawUrl: 'https://ana.dev/blog',
        rawSlug: 'blog',
        userId: ana.id,
      });

      expect(result).toMatchObject({
        status: 'success',
        link: { address: 'diegue.link/u/ana/blog' },
      });
    });

    it('lleva el nombre de su usuario también con un alias generado', async () => {
      const result = await shorten({
        rawUrl: 'https://ana.dev/blog',
        rawSlug: undefined,
        userId: ana.id,
      });

      expect(result.status).toBe('success');
      expect(await addressesOf(ana)).toEqual([
        expect.stringMatching(/^diegue\.link\/u\/ana\/[a-zA-Z0-9]{6}$/),
      ]);
    });

    it('es la misma en la lista y en las estadísticas', async () => {
      const encuesta = await createLink(diegue, diegueLink, {
        slug: 'encuesta',
      });
      const cv = await createLink(ana, diegueLink, { slug: 'u/ana/cv' });
      await recordClick(encuesta.id, VISIT);
      await recordClick(cv.id, VISIT);

      for (const [user, link] of [
        [diegue, encuesta],
        [ana, cv],
      ] as const) {
        const [address] = await addressesOf(user);
        const overview = await getClicksOverview({ userId: user.id });
        const stats = await getLinkStats({ id: link.id, userId: user.id });

        expect(overview.topLinks.map(top => top.address)).toEqual([address]);
        expect(stats?.link.address).toBe(address);
      }
    });

    it('lleva el host del sitio si es de trim.cat', async () => {
      const trimCat = await createDomain({ host: 'trim.cat' });
      await createLink(ana, trimCat, { slug: 'x7Kp2a' });

      expect(await addressesOf(ana)).toEqual(['trim.cat/x7Kp2a']);
    });

    it('se conserva al editar el alias', async () => {
      const cv = await createLink(ana, diegueLink, { slug: 'u/ana/cv' });

      await editLink({
        id: cv.id,
        userId: ana.id,
        rawUrl: cv.fullUrl,
        rawSlug: 'curriculum',
      });

      const { links } = await listLinks({ userId: ana.id });
      expect(links).toMatchObject([
        { slug: 'curriculum', address: 'diegue.link/u/ana/curriculum' },
      ]);
    });
  });

  describe('el destino de un enlace', () => {
    const invalid = { status: 'error', error: 'La URL no es válida.' };
    const required = { status: 'error', error: 'La URL es obligatoria.' };

    async function destinationsOf(user: User) {
      const { links } = await listLinks({ userId: user.id });
      return links.map(link => link.fullUrl);
    }

    it('se completa con https si le falta el protocolo', async () => {
      await shorten({
        rawUrl: 'ejemplo.com/articulo',
        rawSlug: 'articulo',
        userId: ana.id,
      });
      await shorten({
        rawUrl: 'ejemplo.com',
        rawSlug: 'inicio',
        userId: ana.id,
      });

      expect((await destinationsOf(ana)).sort()).toEqual([
        'https://ejemplo.com/',
        'https://ejemplo.com/articulo',
      ]);
    });

    it('conserva el protocolo http', async () => {
      await shorten({
        rawUrl: 'http://ejemplo.com',
        rawSlug: undefined,
        userId: ana.id,
      });

      expect(await destinationsOf(ana)).toEqual(['http://ejemplo.com/']);
    });

    it('se rechaza si no es http ni https', async () => {
      for (const rawUrl of [
        'javascript:alert(1)',
        'javascript://%0aalert(1)',
        'ftp://ejemplo.com/archivo',
      ]) {
        expect(
          await shorten({ rawUrl, rawSlug: undefined, userId: ana.id }),
        ).toEqual(invalid);
      }
      expect(await destinationsOf(ana)).toEqual([]);
    });

    it('se rechaza si su dominio no tiene punto', async () => {
      for (const rawUrl of ['localhost:3000', 'intranet', 'notaurl']) {
        expect(
          await shorten({ rawUrl, rawSlug: undefined, userId: ana.id }),
        ).toEqual(invalid);
      }
      expect(await destinationsOf(ana)).toEqual([]);
    });

    it('es obligatorio', async () => {
      for (const rawUrl of [undefined, '', '   ']) {
        expect(
          await shorten({ rawUrl, rawSlug: undefined, userId: ana.id }),
        ).toEqual(required);
      }
      expect(await destinationsOf(ana)).toEqual([]);
    });

    it('al editarlo con uno inválido se conserva el anterior', async () => {
      const cv = await createLink(ana, diegueLink, {
        slug: 'u/ana/cv',
        fullUrl: 'https://ana.dev/cv.pdf',
      });

      expect(
        await editLink({
          id: cv.id,
          userId: ana.id,
          rawUrl: 'javascript:void(0)',
          rawSlug: 'cv',
        }),
      ).toEqual(invalid);
      expect(await destinationsOf(ana)).toEqual(['https://ana.dev/cv.pdf']);
    });

    it('al editarlo se completa con https si le falta el protocolo', async () => {
      const cv = await createLink(ana, diegueLink, { slug: 'u/ana/cv' });

      await editLink({
        id: cv.id,
        userId: ana.id,
        rawUrl: '  ana.dev/cv  ',
        rawSlug: 'cv',
      });

      expect(await destinationsOf(ana)).toEqual(['https://ana.dev/cv']);
    });
  });

  describe('un enlace antiguo', () => {
    beforeEach(async () => {
      await createLink(diegue, diegueLink, {
        slug: 'encuesta',
        fullUrl: 'https://forms.example.com/encuesta',
      });
      await createLink(ana, diegueLink, {
        slug: 'u/ana/cv',
        fullUrl: 'https://ana.dev/cv.pdf',
      });
    });

    it('se ve en el dashboard igual que antes', async () => {
      expect(await addressesOf(diegue)).toEqual(['diegue.link/encuesta']);
      expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/cv']);
    });

    it('sigue llevando a su destino', async () => {
      expect(
        await resolveLink({ domain: 'diegue.link', slug: 'encuesta' }),
      ).toMatchObject({ fullUrl: 'https://forms.example.com/encuesta' });
      expect(
        await resolveLink({ domain: 'diegue.link', slug: 'u/ana/cv' }),
      ).toMatchObject({ fullUrl: 'https://ana.dev/cv.pdf' });
    });
  });

  describe('un enlace de un usuario que después verifica un dominio', () => {
    beforeEach(async () => {
      await createLink(ana, diegueLink, {
        slug: 'u/ana/cv',
        fullUrl: 'https://ana.dev/cv.pdf',
      });
      await createDomain({ host: 'ana.dev', owner: ana });
    });

    it('conserva su dirección', async () => {
      expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/cv']);
    });

    it('sigue llevando a su destino', async () => {
      expect(
        await resolveLink({ domain: 'diegue.link', slug: 'u/ana/cv' }),
      ).toMatchObject({ fullUrl: 'https://ana.dev/cv.pdf' });
    });
  });

  describe('un enlace de trim.cat', () => {
    it('lleva a su destino', async () => {
      const trimCat = await createDomain({ host: 'trim.cat' });
      await createLink(ana, trimCat, {
        slug: 'x7Kp2a',
        fullUrl: 'https://ana.dev/charla',
      });

      expect(
        await resolveLink({ domain: 'trim.cat', slug: 'x7Kp2a' }),
      ).toMatchObject({ fullUrl: 'https://ana.dev/charla' });
    });
  });

  describe('al visitar una dirección', () => {
    it('se obtiene su destino y el clic de una persona suma al total', async () => {
      const cv = await createLink(ana, diegueLink, {
        slug: 'u/ana/cv',
        fullUrl: 'https://ana.dev/cv.pdf',
      });

      const link = await resolveLink({ domain: 'diegue.link', slug: 'u/ana/cv' });
      expect(link).toEqual({ id: cv.id, fullUrl: 'https://ana.dev/cv.pdf' });

      await recordClick(link!.id, { ...VISIT, device: 'mobile' });

      const clicks = await prisma.click.findMany({ where: { urlId: cv.id } });
      expect(clicks).toMatchObject([{ device: 'mobile', isBot: false }]);
      expect(await totalClicks(ana, cv.id)).toBe(1);
    });

    it('el clic de un bot se guarda pero no suma', async () => {
      const encuesta = await createLink(diegue, diegueLink, {
        slug: 'encuesta',
        fullUrl: 'https://forms.example.com/encuesta',
      });

      const link = await resolveLink({ domain: 'diegue.link', slug: 'encuesta' });
      expect(link).toEqual({
        id: encuesta.id,
        fullUrl: 'https://forms.example.com/encuesta',
      });

      await recordClick(link!.id, { ...VISIT, isBot: true });

      const clicks = await prisma.click.findMany({
        where: { urlId: encuesta.id },
      });
      expect(clicks).toMatchObject([{ isBot: true }]);
      expect(await totalClicks(diegue, encuesta.id)).toBe(0);
    });
  });

  describe('un alias', () => {
    it('no se repite dentro de un dominio', async () => {
      const charla = {
        rawUrl: 'https://charlas.example.com/charla',
        rawSlug: 'charla',
        userId: diegue.id,
      };
      await shorten(charla);

      expect(await shorten(charla)).toEqual({
        status: 'error',
        error: 'Este alias ya existe.',
      });
    });

    it('se puede repetir en distintos usuarios', async () => {
      const luis = await createUser({ username: 'luis' });

      for (const user of [ana, luis]) {
        await shorten({
          rawUrl: 'https://example.com/cv.pdf',
          rawSlug: 'cv',
          userId: user.id,
        });
      }

      expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/cv']);
      expect(await addressesOf(luis)).toEqual(['diegue.link/u/luis/cv']);
    });
  });

  describe('una dirección no lleva a ningún destino', () => {
    beforeEach(async () => {
      await createUser({ username: 'luis' });
      await createLink(diegue, diegueLink, { slug: 'encuesta' });
      await createLink(ana, diegueLink, { slug: 'u/ana/cv' });
    });

    it('si el alias no existe', async () => {
      expect(
        await resolveLink({ domain: 'diegue.link', slug: 'noexiste' }),
      ).toBeNull();
    });

    it('si el alias es de un usuario y se visita desde la raíz', async () => {
      expect(await resolveLink({ domain: 'diegue.link', slug: 'cv' })).toBeNull();
    });

    it('si el usuario no existe', async () => {
      expect(
        await resolveLink({ domain: 'diegue.link', slug: 'u/nadie/cv' }),
      ).toBeNull();
    });

    it('si el alias es de otro usuario', async () => {
      expect(
        await resolveLink({ domain: 'diegue.link', slug: 'u/luis/cv' }),
      ).toBeNull();
    });

    it('si el alias antiguo se visita en trim.cat', async () => {
      await createDomain({ host: 'trim.cat' });

      expect(
        await resolveLink({ domain: 'trim.cat', slug: 'u/ana/cv' }),
      ).toBeNull();
    });

    it('si el dominio no existe', async () => {
      expect(
        await resolveLink({ domain: 'otro.example.com', slug: 'encuesta' }),
      ).toBeNull();
    });
  });

  describe('un usuario', () => {
    let luis: User;

    beforeEach(async () => {
      luis = await createUser({ username: 'luis' });
    });

    it('solo ve sus propios enlaces', async () => {
      await createLink(ana, diegueLink, { slug: 'u/ana/cv' });
      await createLink(ana, diegueLink, { slug: 'u/ana/blog' });
      await createLink(luis, diegueLink, { slug: 'u/luis/fotos' });

      expect((await addressesOf(ana)).sort()).toEqual([
        'diegue.link/u/ana/blog',
        'diegue.link/u/ana/cv',
      ]);
    });

    it('no puede editar ni borrar los enlaces de otro', async () => {
      const fotos = await createLink(luis, diegueLink, {
        slug: 'u/luis/fotos',
        fullUrl: 'https://luis.dev/fotos',
      });
      const notFound = { status: 'error', error: 'Este enlace ya no existe.' };

      expect(
        await editLink({
          id: fotos.id,
          userId: ana.id,
          rawUrl: 'https://ana.dev/hackeado',
          rawSlug: 'hackeado',
        }),
      ).toEqual(notFound);
      expect(await removeLink(fotos.id, ana.id)).toEqual(notFound);

      const { links } = await listLinks({ userId: luis.id });
      expect(links).toMatchObject([
        {
          id: fotos.id,
          slug: 'fotos',
          fullUrl: 'https://luis.dev/fotos',
          address: 'diegue.link/u/luis/fotos',
        },
      ]);
    });

    it('no puede ver las estadísticas de los enlaces de otro', async () => {
      const fotos = await createLink(luis, diegueLink, {
        slug: 'u/luis/fotos',
      });
      await recordClick(fotos.id, VISIT);

      expect(await getLinkStats({ id: fotos.id, userId: ana.id })).toBeNull();
    });
  });
});
