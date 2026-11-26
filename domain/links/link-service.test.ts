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
import { createLink, createUser } from '@/tests/factories';

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
  describe('cuando se muestra el enlace', () => {
    it('se muestra la dirección y los enlaces del admin cuelgan de la raíz', async () => {
      const admin = await createUser({ username: 'diegue', isAdmin: true });
      await createLink(admin, { slug: 'encuesta' });

      expect(await addressesOf(admin)).toEqual(['diegue.link/encuesta']);
    });

    it('se muestra la dirección y los enlaces de un usuario llevan su nombre', async () => {
      const ana = await createUser({ username: 'ana' });
      await createLink(ana, { slug: 'cv' });

      expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/cv']);
    });

    it('las estadísticas muestran la misma dirección que la lista', async () => {
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

    it('al crearlo se devuelve su dirección', async () => {
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
  });

  describe('cuando se visita una dirección', () => {
    let admin: User;
    let ana: User;

    beforeEach(async () => {
      admin = await createUser({ username: 'diegue', isAdmin: true });
      ana = await createUser({ username: 'ana' });
    });

    it('se resuelve el destino de un usuario y el clic de una persona suma al total', async () => {
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

    it('se resuelve el destino del admin y el clic de un bot se guarda sin sumar', async () => {
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

  describe('cuando la dirección no existe', () => {
    beforeEach(async () => {
      const admin = await createUser({ username: 'diegue', isAdmin: true });
      const ana = await createUser({ username: 'ana' });
      await createUser({ username: 'luis' });
      await createLink(admin, { slug: 'encuesta' });
      await createLink(ana, { slug: 'cv' });
    });

    it('no se resuelve un alias que no existe en la raíz', async () => {
      expect(await resolveLink({ slug: 'noexiste' })).toBeNull();
    });

    it('no se resuelve en la raíz el alias de un usuario normal', async () => {
      expect(await resolveLink({ slug: 'cv' })).toBeNull();
    });

    it('no se resuelve si el usuario no existe', async () => {
      expect(await resolveLink({ username: 'nadie', slug: 'cv' })).toBeNull();
    });

    it('no se resuelve el alias de otro usuario', async () => {
      expect(await resolveLink({ username: 'luis', slug: 'cv' })).toBeNull();
    });
  });

  describe('cuando un usuario gestiona sus enlaces', () => {
    let ana: User;
    let luis: User;

    beforeEach(async () => {
      ana = await createUser({ username: 'ana' });
      luis = await createUser({ username: 'luis' });
    });

    it('solo se listan los suyos', async () => {
      await createLink(ana, { slug: 'cv' });
      await createLink(ana, { slug: 'blog' });
      await createLink(luis, { slug: 'fotos' });

      expect((await addressesOf(ana)).sort()).toEqual([
        'diegue.link/u/ana/blog',
        'diegue.link/u/ana/cv',
      ]);
    });

    it('no se puede editar ni borrar el enlace de otro', async () => {
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
  });
});
