import { beforeEach, describe, expect, test } from 'vitest';
import { prisma } from '@/lib/prisma';
import { recordClick } from '@/domain/repositories/click-repository';
import type { ClickMetadata } from '@/lib/analytics/click-metadata';
import { resolveLink } from '@/domain/links/link-service';
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

async function totalClicks(id: number) {
  const link = await prisma.url.findUniqueOrThrow({ where: { id } });
  return link.clicks;
}

describe('R2: una Dirección redirige a su Destino y registra el Clic', () => {
  let admin: Awaited<ReturnType<typeof createUser>>;
  let ana: Awaited<ReturnType<typeof createUser>>;

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
    expect(await totalClicks(cv.id)).toBe(1);
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
    expect(await totalClicks(encuesta.id)).toBe(0);
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
