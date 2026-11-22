/**
 * Genera Clics falsos para ver las gráficas en local.
 * Uso: yarn seed:clicks [clicsPorEnlace]
 * Solo se ejecuta contra una BDD en localhost.
 */
import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env.DATABASE_URL ?? '';
const host = (() => {
  try {
    return new URL(DATABASE_URL).hostname;
  } catch {
    return '';
  }
})();

if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error(`Abortado: DATABASE_URL apunta a "${host}", no a localhost.`);
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(DATABASE_URL) });

const DAYS = 60;
const perLink = Number(process.argv[2]) || 400;

// [valor, peso]
type Weighted<T> = [T, number][];

const countries: Weighted<[string, string]> = [
  [['ES', 'Madrid'], 30],
  [['ES', 'Barcelona'], 18],
  [['ES', 'Valencia'], 8],
  [['MX', 'Ciudad de México'], 12],
  [['AR', 'Buenos Aires'], 8],
  [['US', 'New York'], 7],
  [['CO', 'Bogotá'], 5],
  [['DE', 'Berlin'], 3],
  [['FR', 'Paris'], 3],
  [['GB', 'London'], 3],
  [['CL', 'Santiago'], 3],
];
const devices: Weighted<string> = [
  ['mobile', 62],
  ['desktop', 33],
  ['tablet', 5],
];
const referrers: Weighted<string | null> = [
  [null, 45],
  ['t.co', 15],
  ['linkedin.com', 10],
  ['google.com', 9],
  ['instagram.com', 7],
  ['github.com', 6],
  ['reddit.com', 4],
  ['news.ycombinator.com', 4],
];
const desktopOs: Weighted<string> = [
  ['Mac OS', 45],
  ['Windows', 45],
  ['Linux', 10],
];
const mobileOs: Weighted<string> = [
  ['iOS', 55],
  ['Android', 45],
];
const browsers: Record<string, Weighted<string>> = {
  iOS: [
    ['Mobile Safari', 80],
    ['Chrome', 20],
  ],
  Android: [
    ['Chrome', 85],
    ['Samsung Browser', 15],
  ],
  default: [
    ['Chrome', 65],
    ['Safari', 15],
    ['Firefox', 12],
    ['Edge', 8],
  ],
};

function pick<T>(items: Weighted<T>): T {
  const total = items.reduce((acc, [, w]) => acc + w, 0);
  let r = Math.random() * total;
  for (const [value, weight] of items) {
    r -= weight;
    if (r <= 0) return value;
  }
  return items[items.length - 1][0];
}

// Más tráfico reciente, por la tarde y entre semana
function randomDate() {
  const daysAgo = Math.floor(Math.pow(Math.random(), 1.6) * DAYS);
  const date = new Date(Date.now() - daysAgo * 86_400_000);
  const hour = pick<number>(
    Array.from({ length: 24 }, (_, h) => [h, h < 7 ? 1 : h < 17 ? 4 : 7]),
  );
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  if (date > new Date()) date.setTime(Date.now() - 60_000);
  return date;
}

async function main() {
  const urls = await prisma.url.findMany({ select: { id: true, slug: true } });
  if (urls.length === 0) {
    console.log('No hay Enlaces. Crea alguno desde el dashboard primero.');
    return;
  }

  for (const url of urls) {
    const count = Math.round(perLink * (0.3 + Math.random()));
    const data = Array.from({ length: count }, () => {
      const isBot = Math.random() < 0.08;
      const device = pick(devices);
      const os = device === 'desktop' ? pick(desktopOs) : pick(mobileOs);
      const [country, city] = pick(countries);
      return {
        urlId: url.id,
        createdAt: randomDate(),
        isBot,
        device,
        os,
        browser: pick(browsers[os] ?? browsers.default),
        referrer: pick(referrers),
        country,
        city,
      };
    });

    const humans = data.filter(d => !d.isBot).length;
    await prisma.$transaction([
      prisma.click.createMany({ data }),
      prisma.url.update({
        where: { id: url.id },
        data: { clicks: { increment: humans } },
      }),
    ]);
    console.log(`${url.slug}: ${count} Clics (${humans} de personas)`);
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
