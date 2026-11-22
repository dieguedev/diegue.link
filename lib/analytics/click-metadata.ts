import { userAgent, type NextRequest } from 'next/server';

export type ClickMetadata = {
  isBot: boolean;
  device: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
};

// `isBot` de Next ya cubre Google, Slack, WhatsApp, Discord, X, Facebook, LinkedIn...
// Esto añade los que se le escapan y cualquier UA genérico de crawler o vista previa
const EXTRA_BOTS =
  /bot\b|crawler|spider|preview|TelegramBot|Iframely|Embedly|curl|wget|python-requests|axios|node-fetch|HeadlessChrome/i;

function clip(value: string | undefined | null, max: number) {
  if (!value) return null;
  return value.slice(0, max);
}

function referrerHost(referer: string | null, ownHost: string | null) {
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname.replace(/^www\./, '');
    // Un Clic desde el propio dashboard no es un origen interesante
    if (ownHost && host === ownHost.replace(/^www\./, '').split(':')[0]) {
      return null;
    }
    return clip(host, 255);
  } catch {
    return null;
  }
}

function decodeHeader(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function deviceType(type: string | undefined) {
  if (type === 'mobile' || type === 'tablet') return type;
  if (!type) return 'desktop';
  return 'other';
}

export function getClickMetadata(request: NextRequest): ClickMetadata {
  const { headers } = request;
  const ua = userAgent(request);
  const isBot = ua.isBot || !ua.ua || EXTRA_BOTS.test(ua.ua);

  return {
    isBot,
    device: deviceType(ua.device.type),
    browser: clip(ua.browser.name, 50),
    os: clip(ua.os.name, 50),
    referrer: referrerHost(headers.get('referer'), headers.get('host')),
    // Vercel y Cloudflare geolocalizan por IP; en local no llega nada
    country: clip(
      headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry'),
      2,
    )?.toUpperCase() ?? null,
    city: clip(decodeHeader(headers.get('x-vercel-ip-city')), 100),
  };
}
