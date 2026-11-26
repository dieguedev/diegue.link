import { beforeEach, describe, expect, test } from 'vitest';
import { prisma } from '@/lib/prisma';
import { recordClick } from '@/domain/repositories/click-repository';
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
  return links.map(link => link.shortUrl);
}

async function totalClicks(user: User, id: number) {
  const { links } = await listLinks({ userId: user.id });
  return links.find(link => link.id === id)?.clicks;
}

describe('R1: el Enlace se muestra con su Dirección', () => {
  test('E1: los Enlaces del admin cuelgan de la raíz', async () => {
    const admin = await createUser({ username: 'diegue', isAdmin: true });
    await createLink(admin, { slug: 'encuesta' });

    expect(await addressesOf(admin)).toEqual(['diegue.link/encuesta']);
  });

  test('E2: los Enlaces de un Usuario llevan su nombre', async () => {
    const ana = await createUser({ username: 'ana' });
    await createLink(ana, { slug: 'cv' });

    expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/cv']);
  });

  test('E4: al crear un Enlace se devuelve su Dirección', async () => {
    const ana = await createUser({ username: 'ana' });

    const result = await shorten({
      rawUrl: 'https://ana.dev/portfolio',
      rawSlug: 'portfolio',
      userId: ana.id,
    });

    expect(result).toMatchObject({
      status: 'success',
      link: { slug: 'portfolio', shortUrl: 'diegue.link/u/ana/portfolio' },
    });
    expect(await addressesOf(ana)).toEqual(['diegue.link/u/ana/portfolio']);
  });
});

describe('R2: una Dirección redirige a su Destino y registra el Clic', () => {
  let admin: User;
  let ana: User;

  beforeEach(async () => {
    admin = await createUser({ username: 'diegue', isAdmin: true });
    ana = await createUser({ username: 'ana' });
  });

  test('E1: la Dirección de un Usuario suma un Clic de una persona', async () => {
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

  test('E2: la Dirección del admin guarda el Clic de un bot sin sumarlo', async () => {
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

describe('R3: una Dirección que no existe no resuelve', () => {
  beforeEach(async () => {
    const admin = await createUser({ username: 'diegue', isAdmin: true });
    const ana = await createUser({ username: 'ana' });
    await createUser({ username: 'luis' });
    await createLink(admin, { slug: 'encuesta' });
    await createLink(ana, { slug: 'cv' });
  });

  test('E1: un Alias que no existe en la raíz', async () => {
    expect(await resolveLink({ slug: 'noexiste' })).toBeNull();
  });

  test('E1: el Alias de un Usuario normal no resuelve en la raíz', async () => {
    expect(await resolveLink({ slug: 'cv' })).toBeNull();
  });

  test('E2: un Usuario que no existe', async () => {
    expect(await resolveLink({ username: 'nadie', slug: 'cv' })).toBeNull();
  });

  test('E3: el Alias de otro Usuario', async () => {
    expect(await resolveLink({ username: 'luis', slug: 'cv' })).toBeNull();
  });
});

describe('R4: un Usuario solo ve y toca sus propios Enlaces', () => {
  let ana: User;
  let luis: User;

  beforeEach(async () => {
    ana = await createUser({ username: 'ana' });
    luis = await createUser({ username: 'luis' });
  });

  test('E1: la lista solo trae los Enlaces del Usuario', async () => {
    await createLink(ana, { slug: 'cv' });
    await createLink(ana, { slug: 'blog' });
    await createLink(luis, { slug: 'fotos' });

    expect((await addressesOf(ana)).sort()).toEqual([
      'diegue.link/u/ana/blog',
      'diegue.link/u/ana/cv',
    ]);
  });

  test('E2: no puede editar ni borrar el Enlace de otro', async () => {
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
        shortUrl: 'diegue.link/u/luis/fotos',
      },
    ]);
  });
});
