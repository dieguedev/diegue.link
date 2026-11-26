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

async function addressesOf(user: User) {
  const { links } = await listLinks({ userId: user.id });
  return links.map(link => link.address);
}

async function totalClicks(user: User, id: number) {
  const { links } = await listLinks({ userId: user.id });
  return links.find(link => link.id === id)?.clicks;
}

describe('En link service', () => {
  describe('la dirección de un enlace', () => {
    it('se devuelve al crearlo', async () => {
      const ana = await createUser({ username: 'ana' });

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

    it('cuelga de la raíz si el enlace es del admin', async () => {
      const admin = await createUser({ username: 'diegue', isAdmin: true });
      await createLink(admin, { slug: 'encuesta' });

      expect(await addressesOf(admin)).toEqual(['diegue.link/encuesta']);
    });

    it('lleva el nombre de su usuario si no lo es', async () => {
      const ana = await createUser({ username: 'ana' });
      await createLink(ana, { slug: 'cv' });

      expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/cv']);
    });

    it('se guarda en el dominio principal', async () => {
      const diegueLink = await createDomain({ host: 'diegue.link' });
      const ana = await createUser({ username: 'ana' });

      await shorten({
        rawUrl: 'https://ana.dev/portfolio',
        rawSlug: 'portfolio',
        userId: ana.id,
      });
      await shorten({
        rawUrl: 'https://ana.dev/blog',
        rawSlug: undefined,
        userId: ana.id,
      });

      const links = await prisma.url.findMany({ where: { userId: ana.id } });
      expect(links.map(link => link.domainId)).toEqual([
        diegueLink.id,
        diegueLink.id,
      ]);
    });

    it('es la misma en la lista y en las estadísticas', async () => {
      const admin = await createUser({ username: 'diegue', isAdmin: true });
      const ana = await createUser({ username: 'ana' });
      const encuesta = await createLink(admin, { slug: 'encuesta' });
      const cv = await createLink(ana, { slug: 'cv' });
      await recordClick(encuesta.id, VISIT);
      await recordClick(cv.id, VISIT);

      for (const [user, link] of [
        [admin, encuesta],
        [ana, cv],
      ] as const) {
        const [address] = await addressesOf(user);
        const overview = await getClicksOverview({ userId: user.id });
        const stats = await getLinkStats({ id: link.id, userId: user.id });

        expect(overview.topLinks.map(top => top.address)).toEqual([address]);
        expect(stats?.link.address).toBe(address);
      }
    });
  });

  describe('el destino de un enlace', () => {
    let ana: User;
    const invalid = { status: 'error', error: 'La URL no es válida.' };
    const required = { status: 'error', error: 'La URL es obligatoria.' };

    async function destinationsOf(user: User) {
      const { links } = await listLinks({ userId: user.id });
      return links.map(link => link.fullUrl);
    }

    beforeEach(async () => {
      ana = await createUser({ username: 'ana' });
    });

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
      const cv = await createLink(ana, {
        slug: 'cv',
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
      const cv = await createLink(ana, { slug: 'cv' });

      await editLink({
        id: cv.id,
        userId: ana.id,
        rawUrl: '  ana.dev/cv  ',
        rawSlug: 'cv',
      });

      expect(await destinationsOf(ana)).toEqual(['https://ana.dev/cv']);
    });
  });

  describe('al visitar una dirección', () => {
    let admin: User;
    let ana: User;

    beforeEach(async () => {
      admin = await createUser({ username: 'diegue', isAdmin: true });
      ana = await createUser({ username: 'ana' });
    });

    it('se obtiene su destino y el clic de una persona suma al total', async () => {
      const cv = await createLink(ana, {
        slug: 'cv',
        fullUrl: 'https://ana.dev/cv.pdf',
      });

      const link = await resolveLink({ username: 'ana', slug: 'cv' });
      expect(link).toEqual({ id: cv.id, fullUrl: 'https://ana.dev/cv.pdf' });

      await recordClick(link!.id, { ...VISIT, device: 'mobile' });

      const clicks = await prisma.click.findMany({ where: { urlId: cv.id } });
      expect(clicks).toMatchObject([{ device: 'mobile', isBot: false }]);
      expect(await totalClicks(ana, cv.id)).toBe(1);
    });

    it('el clic de un bot se guarda pero no suma', async () => {
      const encuesta = await createLink(admin, {
        slug: 'encuesta',
        fullUrl: 'https://forms.example.com/encuesta',
      });

      const link = await resolveLink({ slug: 'encuesta' });
      expect(link).toEqual({
        id: encuesta.id,
        fullUrl: 'https://forms.example.com/encuesta',
      });

      await recordClick(link!.id, { ...VISIT, isBot: true });

      const clicks = await prisma.click.findMany({
        where: { urlId: encuesta.id },
      });
      expect(clicks).toMatchObject([{ isBot: true }]);
      expect(await totalClicks(admin, encuesta.id)).toBe(0);
    });
  });

  describe('una dirección no lleva a ningún destino', () => {
    beforeEach(async () => {
      const admin = await createUser({ username: 'diegue', isAdmin: true });
      const ana = await createUser({ username: 'ana' });
      await createUser({ username: 'luis' });
      await createLink(admin, { slug: 'encuesta' });
      await createLink(ana, { slug: 'cv' });
    });

    it('si el alias no existe', async () => {
      expect(await resolveLink({ slug: 'noexiste' })).toBeNull();
    });

    it('si el alias es de un usuario y se visita desde la raíz', async () => {
      expect(await resolveLink({ slug: 'cv' })).toBeNull();
    });

    it('si el usuario no existe', async () => {
      expect(await resolveLink({ username: 'nadie', slug: 'cv' })).toBeNull();
    });

    it('si el alias es de otro usuario', async () => {
      expect(await resolveLink({ username: 'luis', slug: 'cv' })).toBeNull();
    });
  });

  describe('un usuario', () => {
    let ana: User;
    let luis: User;

    beforeEach(async () => {
      ana = await createUser({ username: 'ana' });
      luis = await createUser({ username: 'luis' });
    });

    it('solo ve sus propios enlaces', async () => {
      await createLink(ana, { slug: 'cv' });
      await createLink(ana, { slug: 'blog' });
      await createLink(luis, { slug: 'fotos' });

      expect((await addressesOf(ana)).sort()).toEqual([
        'diegue.link/u/ana/blog',
        'diegue.link/u/ana/cv',
      ]);
    });

    it('no puede editar ni borrar los enlaces de otro', async () => {
      const fotos = await createLink(luis, {
        slug: 'fotos',
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
      const fotos = await createLink(luis, { slug: 'fotos' });
      await recordClick(fotos.id, VISIT);

      expect(await getLinkStats({ id: fotos.id, userId: ana.id })).toBeNull();
    });
  });
});
